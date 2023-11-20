import { Component } from "react";
import "./index.css";

const keyMap = ["0", "1", "2", "3", "4", "5", "6", "7", "BackSpace", "Tab", "10 ", "11 ", "Clear", "Enter", "14 ", "15 ", "Shift", "Ctrl", "Alt", "19 ", "⇪", "21", "22", "23", "24", "25", "26", "Esc", "28", "29", "30", "31", "Spacebar", "Page Up", "Page Down", "End", "Home", "←", "↑", "→", "↓", "41", "42", "43", "44", "Insert", "Delete", "47", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "58", "59", "60", "61", "62", "63", "64", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "91", "92", "CMD", "94", "95", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "+", "Enter", "-", ".", "/", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "124", "125", "126", "127", "128", "129", "130", "131", "132", "133", "134", "135", "136", "137", "138", "139", "140", "141", "142", "143", "Num Lock", "145", "146", "147", "148", "149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "搜索", "收藏", "浏览器", "静音", "音量减", "音量加", "176", "177", "178", "停止", "邮件", "181", "182", "183", "184", "185", ";", "=", "<", "-", ">", "/", "～", "193", "194", "195", "196", "197", "198", "199", "200", "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "[", "\\", "]", "\""]
export default class KeyBoard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            letterKey: '', // 数组，用于存储字母键
            shift: false, // 布尔值，表示是否按下了Shift键
            ctrl: false, // 布尔值，表示是否按下了Control键
            alt: false, // 布尔值，表示是否按下了Alt键
            meta: false, // 布尔值，表示是否按下了Meta键
        }
    }

    listeenrKey = (e) => {
        const { input } = this
        input.addEventListener("keydown",this.keydown)
        input.addEventListener('keyup',this.keyup)
    }
    keydown = (e) => {
        let newshift = this.state.shift
        switch (e.key) {
            case 'Shift':
                this.setState({ shift: !newshift }, () => { console.log('100', this.state.shift); })
                console.log(newshift);
                break
            case 'Control':
                this.setState({ ctrl: !this.state.ctrl })
                break
            case 'Alt':
                this.setState({ alt: !this.state.alt })
                break
            case 'Meta':
                this.setState({ meta: !this.state.meta })
                break
            case 'Backspace':
                if (this.state.letterKey === 'BackSpace') {
                    this.setState({ letterKey: '', shift: false, ctrl: false, alt: false, meta: false })
                } else {
                    this.setState({ letterKey: keyMap[e.keyCode] })
                }
                break
            default:
                this.setState({ letterKey: keyMap[e.keyCode] })
                break
        }
    }
    keyup = (e) => {
        const { letterKey, shift, ctrl, alt, meta } = this.state
        const key = [alt ? 'alt' : '', ctrl ? 'ctrl' : '', meta ? 'meta' : '', shift ? 'shift' : '', letterKey]
        this.props.keys(key)
    }
    // 清除鼠标按下监听事件：
    removeKeydownListener = () => {
        const { input } = this;
        input.removeEventListener('keydown', this.keydown)
        input.removeEventListener('keyup', this.keyup)
    }
    componentDidMount() {
        const { input } = this;
        input.addEventListener('focus', this.listeenrKey)
        input.addEventListener('blur', this.removeKeydownListener)
    }
    render() {
        const { t } = this.props
        const { letterKey, shift, ctrl, alt, meta } = this.state
        const keyMap = {
            win: {
                ctrl: 'ctrl',
                alt: 'alt',
                shift: 'shift',
                cmd: 'win'
            },
            mac: {
                ctrl: '⌃',
                alt: '⌥',
                shift: '⇧',
                meta: '⌘'
            }
        }
        const isMac = /Mac/i.test(navigator.userAgent)
        return (
            <div ref={c => this.input = c} className="keyInput" onClick={this.listeenrKey} tabIndex={0}>
                <span className="keyTips" style={{ display: !shift && !ctrl && !alt && !meta && !letterKey ? "flex" : "none" }}>{t('placeholderKey')}</span>
                <div className="keys" style={{ display: this.state.alt ? "flex" : "none" }}>{isMac ? keyMap.mac.alt : keyMap.win.alt}</div>
                <div className="keys" style={{ display: this.state.ctrl ? "flex" : "none" }}>{isMac ? keyMap.mac.ctrl : keyMap.win.ctrl}</div>
                <div className="keys" style={{ display: this.state.meta ? "flex" : "none" }}>{isMac ? keyMap.mac.meta : keyMap.win.meta}</div>
                <div className="keys" style={{ display: this.state.shift ? "flex" : "none" }}>{isMac ? keyMap.mac.shift : keyMap.win.shift}</div>
                <div className="keys" style={{ display: this.state.letterKey ? "flex" : "none" }}>{this.state.letterKey}</div>
            </div>
        )
    }
}