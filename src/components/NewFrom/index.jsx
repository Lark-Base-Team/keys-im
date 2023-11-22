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
        // checkLoading: false,
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
        this.props.addItem(this.state)
        // 清空输入框
        keyBoard = keyBoard + 1
        this.setState({
            win: [],
            mac: [],
        })
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
            this.setState({ checkLoading: true })
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
            this.setState({ checkLoading: false })
        }
    }
    goOn = async (e) => {
        Toast.close(this.state.toast)
        this.setState({ toast: null }) 
        this.add(e)
    }
    addAndCheck = async (e) => {
        const result = await this.check(e)
        if (!result) return
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
                <Button size="large" theme="solid" className="addInput" onClick={this.addAndCheck} loading={this.props.loading}>{t('add')}</Button>
                {/* <Button loading={this.state.checkLoading} size="large" className="addInput" onClick={this.check}>{t('check')}</Button> */}

            </form>
        )
    }
}