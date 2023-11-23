import React, { Component, createRef } from "react"
import { TextArea, Button, Toast, Typography, } from '@douyinfe/semi-ui';
import KeyBoard from "../KeyBoard"
import { bitable } from '@lark-base-open/js-sdk'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import "./index.css"

const base = bitable.base
let keyBoard = 1

export default class NewFrom extends Component {
    inputRef = createRef()
    // 状态
    state = {
        title: '', // 输入框中的标题文本
        win: [],
        mac: [],
        loading: false,
        copied: false,
        toast: null
    }
    // 添加数据
    add = (event) => {
        const { t } = this.props
        const toastAllEmpty = t('toastAllEmpty')
        const titleEmpty = t('titleEmpty')
        const keyEmpty = t('keyEmpty')
        const { inputTitleRef } = this
        // 阻止默认事件
        event.preventDefault();
        // 判断
        const { mac, win } = this.state;
        if (inputTitleRef.value === '' && (mac.length === 0 && win.length === 0)) {
            Toast.warning({
                content: toastAllEmpty,
                duration: 2,
            })
            return
        } else if (inputTitleRef.value === '') {
            Toast.warning({
                content: titleEmpty,
                duration: 2,
            })
            return
        } else if (mac.length === 0 && win.length === 0) {
            Toast.warning({
                content: keyEmpty,
                duration: 2,
            })
            return
        }
        this.addItem(this.state)
        // 清空输入框
        keyBoard = keyBoard + 1
        this.setState({
            win: [],
            mac: [],
        })
    }
    addItem = async (itemObj) => {
        const { t } = this.props
        const addSuccess = t('addSuccess')
        const errorField = t('errorField')
        this.setState({ keys: itemObj })
        try {
          const table = await base.getActiveTable()
          const fieldMetaList = await table.getFieldMetaList();
    
          let macTitle = false
          let winTitle = false
          // 判断是否有mac快捷键和win快捷键字段，如果没有则创建字段
          fieldMetaList.forEach(item => {
            if (item.name === 'mac快捷键') {
              macTitle = true
            }
            if (item.name === 'win快捷键') {
              winTitle = true
            }
          })
          if (!macTitle) {
            await table.addField({ type: 1, name: 'mac快捷键' }) //新建文字字段
          }
          if (!winTitle) {
            await table.addField({ type: 1, name: 'win快捷键' }) //新建文字字段
          }
          // 添加记录
          const fieldTitleList = await table.getFieldList()
          let fieldTitle = fieldTitleList[0]
          const fieldMac = await table.getField('mac快捷键')
          const fieldWin = await table.getField('win快捷键')
          const fieldTitleObj = await table.getFieldMetaById(fieldTitle)
          if (fieldTitleObj.type !== 1) {
            Toast.error({
              content: errorField,
              duration: 0,
            })
            return
          }
          await table.addRecord({
            fields: {
              [fieldTitleObj.id]: itemObj.title,
              [fieldMac.id]: itemObj.mac.join(' + '),
              [fieldWin.id]: itemObj.win.join(' + ')
            }
          })
          await Toast.success({
            content: addSuccess,
            duration: 2,
            showClose: false,
          })
        } finally {
          this.setState({ loading: false })
        }
      }
    // 生成mac和win不同格式的快捷键
    keys = (e) => {
        const isWindows = /Windows/i.test(navigator.userAgent);
        const isMac = /Mac/i.test(navigator.userAgent);
        if (isWindows) {
            const keyCode = e.filter(Boolean)
            const mackey = keyCode.map(item => {
                const keyMap = {
                    ctrl: '⌃',
                    alt: '⌥',
                    shift: '⇧',
                    meta: '⌘'
                };
                return keyMap[item] || item;
            });
            const winkey = keyCode
            this.setState({
                mac: mackey,
                win: winkey,
            })
        }
        if (isMac) {
            const keyCode = e.filter(Boolean)
            const mackey = keyCode.map(item => {
                const keyMap = {
                    ctrl: '⌃',
                    alt: '⌥',
                    shift: '⇧',
                    meta: '⌘'
                };
                return keyMap[item] || item;
            });
            const winkey = keyCode.map(item => {
                const keyMap = {
                    ctrl: 'win',
                    meta: 'ctrl',
                }
                return keyMap[item] || item;
            })
            this.setState({
                mac: mackey,
                win: winkey,
            })
        }
    }
    // 获取当前表的记录
    check = async (e) => {
        try {
            let text = ''
            const table = await base.getActiveTable()
            const allRecords = await table.getRecords({
                pageSize: 5000
            })
            const records = allRecords.records
            const fieldWin = await table.getFieldByName('win快捷键')
            for (let i = 0; i < records.length; i++) {
                let winCellValue = records[i].fields[fieldWin.id][0].text
                if (winCellValue === this.state.win.join(' + ')) {
                    text = winCellValue
                    break
                }
            }
            const { t } = this.props
            const keyDisabled1 = t('keyDisabled1')
            if (text === '') {
                return true
            } else {
                const { Text } = Typography
                let toast = Toast.warning({
                    content: (
                        <span>
                            <div>{keyDisabled1}</div>
                            <CopyToClipboard text={text}
                                onCopy={() => this.setState({ copied: true })}>
                                <Text link>复制快捷键</Text>
                            </CopyToClipboard>
                            <Text link onClick={this.goOn} style={{ marginLeft: '10px' }}>继续添加</Text>
                        </span>
                    ),
                    duration: 0,
                })
                this.setState({ toast: toast })
            }
        } finally {
        }
    }
    goOn = async (e) => {
        this.setState({ loading: true })
        Toast.close(this.state.toast)
        this.setState({ toast: null }) 
        this.add(e)
    }
    addAndCheck = async (e) => {
        this.setState({ loading: true })
        const result = await this.check(e)
        if (!result) return this.setState({ loading: false })
        await this.add(e)
    }
    render() {
        const { t } = this.props
        return (
            <form name="mydata" className="gridAdd">
                <TextArea key={keyBoard + 1} autosize={{ minRows: 1, maxRows: 4 }}
                    className="addInput"
                    placeholder={t('placeholderTitle')}
                    ref={e => this.inputTitleRef = e}
                    onChange={(value) => this.setState({ title: value })}
                />
                <KeyBoard className="addInput" keys={this.keys} key={keyBoard} t={t} />
                <br />
                <Button size="large" theme="solid" className="addInput" onClick={this.addAndCheck} loading={this.state.loading}>{t('add')}</Button>
            </form>
        )
    }
}