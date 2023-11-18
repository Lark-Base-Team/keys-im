import React, { Component, createRef } from "react"
import { TextArea, Button, Toast } from '@douyinfe/semi-ui';
import KeyBoard from "../KeyBoard"
import { bitable } from '@lark-base-open/js-sdk'
import "./index.css"

const base = bitable.base
let message = ''
let keyBoard = 1

export default class NewFrom extends Component {
    inputRef = createRef()
    // 状态
    state = {
        title: '', // 输入框中的标题文本
        win: [],
        mac: [],
        checkLoading: false,
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
                    ctrl: 'Ctrl',
                    alt: 'Alt',
                    shift: 'Shift',
                    cmd: 'Win'
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
                    ctrl: 'Win',
                    meta: 'Ctrl',
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
        try {
            this.setState({ checkLoading: true })
            let macs = []
            let wins = []
            const table = await base.getActiveTable()
            const records = await table.getRecordIdList()
            const fieldMac = await table.getFieldByName('mac快捷键')
            const fieldWin = await table.getFieldByName('win快捷键')
            for (let i = 0; i < records.length; i++) {
                let macCellValue = await fieldMac.getCellString(records[i])
                let winCellValue = await fieldWin.getCellString(records[i])
                macs = [...macs, macCellValue]
                wins = [...wins, winCellValue]
            }
            // 判断是否重复，并记录重复的行
            let index = []
            for (let i = 0; i < macs.length; i++) {
                if (macs[i] === this.state.mac.join(' + ')) {
                    index = [...index, i + 1]
                }
            }
            let timeOut = 2
            const { t } = this.props
            const keyEmpty = t('keyEmpty')
            const keyAvailable = t('keyAvailable')
            const keyDisabled1 = t('keyDisabled1')
            const keyDisabled2 = t('keyDisabled2')

            if (this.state.mac.length === 0) {
                message = keyEmpty
            } else {
                if (index.length === 0) {
                    message = keyAvailable
                } else {
                    message = keyDisabled1 + index.join('、') + keyDisabled2
                    timeOut = 20
                }
            }
            Toast.info({
                content: message,
                duration: timeOut,
            })
        } finally {
            this.setState({ checkLoading: false })
        }
    }
    render() {
        const { t } = this.props
        return (
            <form name="mydata" className="gridAdd">
                <TextArea key={keyBoard + 1} autosize={{ minRows: 2, maxRows: 4 }}
                    className="addInput"
                    placeholder={ t('placeholderTitle')}
                    ref={e => this.inputTitleRef = e}
                    onChange={(value) => this.setState({ title: value })}
                />
                <KeyBoard className="addInput" keys={this.keys} key={keyBoard} t={t} />
                <br />
                <Button size="large" theme="solid" className="addInput" onClick={this.add} loading={this.props.loading}>{ t('add')}</Button>
                <Button loading={this.state.checkLoading} size="large" className="addInput" onClick={this.check}>{ t('check') }</Button>

            </form>
        )
    }
}