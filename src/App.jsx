import React, { Component } from 'react';
import Login from './components/Login';
import DependencyChartPage from './components/DependencyChartPage';
import { loadUserData } from './services/userDataService';

class App extends Component {
  state = {
    loading: true,
    username: '',
    jiraUrl: '',
  };

  constructor(props) {
    super(props);

    loadUserData().then(settings => {
      this.setState({
        settings,
        loading: false
      });
    }, () => this.setState({ loading: false }));
  }

  setService(jiraService) {
    this.setState({ jiraService });
  }

  render() {
    const { jiraService, settings, loading } = this.state;
    if (jiraService) {
      return (<DependencyChartPage jiraService={jiraService} />);
    } else if (!loading) {
      return (<Login settings={settings} onCredentialsVerified={(...args) => this.setService(...args)} />);
    } else {
      return 'Loading...';
    }
  }
}

export default App;
module.exports = App;
