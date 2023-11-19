import NewFrom from './components/NewFrom'
import { Component } from 'react'
import { Toast } from '@douyinfe/semi-ui';
import { bitable } from '@lark-base-open/js-sdk'



const base = bitable.base
export default class App extends Component {

  state = {
    keys: {},
    history: [],
    loading: false,
    data: []
  }
  test = () => {
    const { t } = this.props
    console.log(t);
  }
  //用于添加一条数据
  addItem = async (itemObj) => {
    const { t } = this.props
    const addSuccess = t('addSuccess')

    try {
      this.setState({ loading: true })
      this.setState({ keys: itemObj })
      const table = await base.getActiveTable()
      const view = await table.getActiveView()
      const fieldMetaList = await table.getFieldMetaList();

      let mac = false
      let win = false
      // 判断是否有mac快捷键和win快捷键字段，如果没有则创建字段
      fieldMetaList.forEach(item => {
        if (item.name === 'mac快捷键') {
          mac = true
        }
        if (item.name === 'win快捷键') {
          win = true
        }
      })
      if (!mac) {
        await table.addField({ type: 1, name: 'mac快捷键' }) //新建文字字段
      }
      if (!win) {
        await table.addField({ type: 1, name: 'win快捷键' }) //新建文字字段
      }
      // 添加记录
      const fieldTitleList = await view.getVisibleFieldIdList()
      const fieldTitle = fieldTitleList[0]
      const fieldMac = await table.getField('mac快捷键')
      const fieldWin = await table.getField('win快捷键')
      // const res = 
      await table.addRecord({
        fields: {
          [fieldTitle]: itemObj.title,
          [fieldMac.id]: itemObj.mac.join(' + '),
          [fieldWin.id]: itemObj.win.join(' + ')
        }
      })
    } finally {
      this.setState({ loading: false })
      Toast.success({
        content: addSuccess,
        duration: 2,
        showClose: false,
      })
    }
    // 撤销功能
    // this.setState({ history: [res, ...this.state.history] })
  }

  render() {
    const { t } = this.props;
    return (
      <div>
        <p className='tips'>
          {t('tips')}
        </p>
        <NewFrom addItem={this.addItem} loading={this.state.loading} t={t} />
      </div>
    )
  }
}
