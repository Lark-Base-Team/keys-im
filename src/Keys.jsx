import NewFrom from './components/NewFrom'
import { Component } from 'react'

export default class App extends Component {

  state = {
  }

  render() {
    const { t } = this.props;
    return (
      <div>
        <p className='tips'>
          {t('tips')}
        </p>
        <NewFrom t={t} />
      </div>
    )
  }
}
