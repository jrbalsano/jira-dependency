import React, { Component } from 'react';
import PropTypes from 'prop-types';
import JiraService from '../services/jiraService';
import { saveUserData } from '../services/userDataService';

class Login extends Component {
  static propTypes = {
    onCredentialsVerified: PropTypes.func,
    settings: PropTypes.shape({
      username: PropTypes.string,
      jiraUrl: PropTypes.string
    })
  };

  static defaultProps = {
    settings: {}
  };

  constructor(props) {
    super(props);

    this.state = {
      username: this.props.settings.username || '',
      password: '',
      url: this.props.settings.jiraUrl || ''
    };
  }


  checkCredentials(event) {
    event.preventDefault();
    const { url, username, password } = this.state;
    const jiraService = new JiraService({
      baseUrl: url,
      username,
      password
    });

    jiraService.getCurrentUser().then(currentUser => {
      this.setState({ error: false });

      saveUserData({
        jiraUrl: url,
        username
      });

      this.props.onCredentialsVerified(jiraService);
    }).catch(() => {
      this.setState({ error: true });
    });
  }

  saveField(fieldName) {
    return (event) => {
      this.setState({ [fieldName]: event.target.value });
    };
  }

  render() {
    const { url, username, password, error } = this.state;

    return (
      <form onSubmit={(...args) => this.checkCredentials(...args)}>
        {error && (
          <p>There was an error connecting to JIRA. Please check your configuration and try again</p>
        )}
        <input type="text" placeholder="username" name="username" value={username} onChange={this.saveField('username')}/>
        <input type="password" placeholder="password" name="password" value={password} onChange={this.saveField('password')} />
        <input type="text" placeholder="JIRA Url" name="url" value={url} onChange={this.saveField('url')} />
        <button value="submit">Verify Credentials</button>
      </form>
    );
  }
}

export default Login;
