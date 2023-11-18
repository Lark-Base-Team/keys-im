import { Component } from 'react'
import Keys from './Keys'
import { withTranslation } from 'react-i18next'

const NewApp = withTranslation()(Keys)

export default class App extends Component {
  render() {
    return (
      <NewApp />
    )
  }
}
