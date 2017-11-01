import React, { Component } from 'react';
import PropTypes from 'prop-types';
import JiraService from '../services/jiraService';
import JiraSearchForm from './JiraSearchForm';
import IssueDependencyChart from './IssueDependencyChart';
import { getUserData } from '../services/userDataService';

class DependencyChartPage extends Component {
  static propTypes = {
    jiraService: PropTypes.instanceOf(JiraService)
  };

  constructor(props) {
    super(props);

    this.state = {
      issuesById: {},
      issueTree: [],
      loading: true
    };

    getUserData().then(settings => {
      this.setState({
        settings,
        loading: false
      });
    }, () => this.setState({ loading: false }));
  }

  onNewIssues = (issues) => {
    const issuesById = issues.reduce((acc, issue) => {
      const dependsOn = [];
      const dependedOnBy = [];

      const links = issue.fields.issuelinks;
      if (Array.isArray(links)) {
        links.forEach(link => {
          if (link.type.name === "Depends") {
            if (link.outwardIssue) {
              dependsOn.push(link.outwardIssue.id);
            }

            if (link.inwardIssue) {
              dependedOnBy.push(link.inwardIssue.id);
            }
          }
        });
      }

      acc[issue.id] = {
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        dependsOn,
        dependedOnBy
      };

      return acc;
    }, {});

    function addDependenciesToIssue(issue) {
      if (issue.childIssues) {
        return;
      }

      const dependedOnById = issue.dependedOnBy;
      issue.childIssues = [];
      dependedOnById.forEach(dependencyId => {
        const dependency = issuesById[dependencyId];
        if (dependency) {
          issue.childIssues.push(dependency);
          addDependenciesToIssue(issuesById[dependencyId]);
        }
      });
    }

    const issueTree = Object.keys(issuesById).reduce((acc, issueId) => {
      const issue = issuesById[issueId];
      // Only looking for issues at the top of the graph, so no depends on,
      // or the only issues it depends on aren't in the search
      if (issue.dependsOn.length > 0 && issue.dependsOn.find(issueId => issuesById[issueId])) {
        return acc;
      }

      addDependenciesToIssue(issue, issuesById);

      acc.push(issue);
      return acc;
    }, []);


    this.setState({
      issueTree: issueTree,
      issuesById: issuesById
    });
  }

  render() {
    const { jiraService } = this.props;
    const { loading, settings, issueTree, issuesById } = this.state;
    if (loading) {
      return 'Loading...';
    }

    return (
      <div className="dependency-chart-layout">
        <JiraSearchForm jiraService={jiraService} settings={settings} onNewIssues={this.onNewIssues} />
        <IssueDependencyChart issueTree={issueTree} issuesById={issuesById} jiraUrl={jiraService.getJiraUrl()} />
      </div>
    );
  }
}

export default DependencyChartPage;
