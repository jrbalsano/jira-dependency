import base64 from 'base-64';

function JiraService({ baseUrl, username, password }) {
  function _fetch({ method, path, queryParams }) {
    method = method ? method : 'GET';

    if (queryParams) {
      const paramKeys = Object.keys(queryParams);

      if (paramKeys.length > 0) {
        path += '?';

        paramKeys.forEach(paramName => {
          path += `${encodeURIComponent(paramName)}=${encodeURIComponent(queryParams[paramName])}&`;
        });

        path = path.substr(0, path.length - 1);
      }
    }

    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + base64.encode(username + ":" + password));

    const options = { method, headers }
    return fetch(baseUrl + path, options)
      .then(response => {
        if (!response.ok) {
          throw new Error(response);
        }

        return response.json();
      });
  };

  this.getIssue = function getIssue({ issue }) {
    return _fetch({
      path: `/rest/api/2/issue/${issue}`
    });
  };

  this.getCurrentUser = function getCurrentUser() {
    return _fetch({
      path: '/rest/api/2/myself'
    });
  };

  this.getQueryResults = function getQueryResults({ query }) {
    return _fetch({
      path: '/rest/api/2/search',
      queryParams: {
        jql: query,
        startAt: 0,
        maxResults: 200
      }
    });
  };
}

export default JiraService;
