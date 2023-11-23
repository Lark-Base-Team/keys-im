import React, { Component } from "react"
import { TextArea, Button, Toast, Typography, } from '@douyinfe/semi-ui';
import KeyBoard from "../KeyBoard"
import { bitable } from '@lark-base-open/js-sdk'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import "./index.css"

const base = bitable.base
let keyBoard = 1

export default class NewFrom extends Component {
    state = {
        title: '',
        win: [],
        mac: [],
        loading: false,
        toast: null,
    }
    // 添加数据
    add = async () => {
        this.setState({ loading: true })
        // 获取翻译文本
        const { t } = this.props
        const toastAllEmpty = t('toastAllEmpty')
        const titleEmpty = t('titleEmpty')
        const keyEmpty = t('keyEmpty')
        const addSuccess = t('addSuccess')
        const errorField = t('errorField')
        // 获取表格对象
        const table = await base.getActiveTable()
        const view = await table.getActiveView()
        const fieldMetaList = await view.getFieldMetaList()
        //判断是否有标题字段
        const fieldTitle = fieldMetaList[0]
        if (fieldTitle.type !== 1) {
            Toast.error({
                content: errorField,
                duration: 5,
            })
            return this.setState({ loading: false })
        }
        // 判断快捷键是否为空
        const { inputTitleRef } = this
        const { mac, win } = this.state;
        if (inputTitleRef.value === '' && (mac.length === 0 && win.length === 0)) {
            Toast.warning({
                content: toastAllEmpty,
                duration: 2,
            })
            return this.setState({ loading: false })
        } else if (inputTitleRef.value === '') {
            Toast.warning({
                content: titleEmpty,
                duration: 2,
            })
            return this.setState({ loading: false })
        } else if (mac.length === 0 && win.length === 0) {
            Toast.warning({
                content: keyEmpty,
                duration: 2,
            })
            return this.setState({ loading: false })
        }
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
        const fieldMac = await table.getField('mac快捷键')
        const fieldWin = await table.getField('win快捷键')
        await table.addRecord({
            fields: {
                [fieldTitle.id]: this.state.title,
                [fieldMac.id]: this.state.mac.join(' + '),
                [fieldWin.id]: this.state.win.join(' + ')
            }
        })
        // 清空输入框
        keyBoard = keyBoard + 1
        this.setState({
            win: [],
            mac: [],
        })
        await Toast.success({
            content: addSuccess,
            duration: 2,
            showClose: false,
        })
        this.setState({ loading: false })
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
    check = async () => {
        let text = ''
        const table = await base.getActiveTable()
        const allRecords = await table.getRecords({
            pageSize: 5000
        })
        const records = allRecords.records
        const fieldWin = await table.getFieldByName('win快捷键')
        console.log(records);
        for (let i = 0; i < records.length; i++) {
            let winCell = records[i].fields[fieldWin.id]
            let winCellValue = winCell ? winCell[0].text : ''
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
                        <CopyToClipboard text={text}>
                            <Text link>复制快捷键</Text>
                        </CopyToClipboard>
                        <Text link onClick={this.goOn} style={{ marginLeft: '10px' }}>继续添加</Text>
                    </span>
                ),
                duration: 0,
            })
            this.setState({ toast: toast })
        }
    }
    goOn = async () => {
        this.setState({ loading: true })
        Toast.close(this.state.toast)
        this.setState({ toast: null })
        this.add()
    }
    addAndCheck = async () => {
        this.setState({ loading: true })
        const result = await this.check()
        if (!result) return this.setState({ loading: false })
        await this.add()
    }
    render() {
        const { t } = this.props
        return (
            <div name="mydata" className="gridAdd">
                <p className='tips'>
                    {t('tips')}
                </p>
                <TextArea key={keyBoard + 1} autosize={{ minRows: 1, maxRows: 4 }}
                    className="addInput"
                    placeholder={t('placeholderTitle')}
                    ref={e => this.inputTitleRef = e}
                    onChange={(value) => this.setState({ title: value })}
                />
                <KeyBoard className="addInput" keys={this.keys} key={keyBoard} t={t} />
                <br />
                <Button size="large" theme="solid" className="addInput" onClick={this.addAndCheck} loading={this.state.loading}>{t('add')}</Button>
            </div>
        )
    }
}