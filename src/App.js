import { Component } from 'react'
import NewFrom from './components/NewFrom'
import { withTranslation } from 'react-i18next'

// 引入i18n组件
const NewApp = withTranslation()(NewFrom)

export default class App extends Component {
  render() {
    return (
      <NewApp />
    )
  }
}
