import React, { Component } from 'react';
import * as d3 from 'd3';
import {event as currentEvent} from 'd3'
import dagre from 'dagre-d3-webpack';

const PADDING = 50;

class IssueDependencyChart extends Component {
  componentDidUpdate() {
    if (!this.node) {
      return;
    }

    const node = this.node;
    const graph = new dagre.graphlib.Graph()
      .setGraph({})
      .setDefaultEdgeLabel(() => { return {}; });
    const { issueTree, issuesById } = this.props;

    Object.keys(issuesById).forEach(issueId => {
      const issue = issuesById[issueId];
      graph.setNode(issueId, {
        rx: 5,
        ry: 5,
        label: issue.key,
      });
    });

    function addEdgeForIssueAndChildren(issue) {
      issue.childIssues.forEach(childIssue => {
        graph.setEdge(issue.id, childIssue.id);
        addEdgeForIssueAndChildren(childIssue);
      });
    };

    issueTree.forEach(addEdgeForIssueAndChildren);

    const renderer = new dagre.render();

    const svg = d3.select(node);
    const inner = svg.append('g');
    const zoom = d3.behavior.zoom().on('zoom', function() {
      inner.attr('transform', `translate(${currentEvent.translate})scale(${currentEvent.scale})`);
    });
    svg.call(zoom);

    try {
      renderer(inner, graph);
    } catch (err) {
      console.log(err);
    }

    // Center the graph
    const graphWidth = graph.graph().width;
    const graphHeight = graph.graph().height;
    const svgHeight = Math.max(svg.node().getBoundingClientRect().height - PADDING, 0);
    const svgWidth = Math.max(svg.node().getBoundingClientRect().width - PADDING, 0);
    const widthDiff = svgWidth - graphWidth;
    const heightDiff = svgHeight - graphHeight;

    if (widthDiff > 0 && heightDiff > 0) {
      // scale up
      if (widthDiff < heightDiff) {
        zoom.scale(svgHeight / graphHeight);
      } else {
        zoom.scale(svgWidth / graphWidth);
      }
    } else {
      // scale down
      if (widthDiff > heightDiff) {
        zoom.scale(svgHeight / graphHeight);
      } else {
        zoom.scale(svgWidth / graphWidth);
      }
    }

    zoom.translate([PADDING / 2, PADDING / 2]);
    zoom.event(svg);
  }

  getChartMaxDepth() {
    const { issueTree, issuesById } = this.props;
    function findMaxDepth(issue) {
      const childIssueDepths = !issue.childIssues.length ?
        [1] :
        issue.childIssues.map(childIssue => findMaxDepth(childIssue) + 1);
      return Math.max(...childIssueDepths);
    }

    return issueTree.reduce((acc, issue) => {
      return Math.max(findMaxDepth(issue), acc);
    }, 0);
  }

  render() {
    return (
      <svg className="dependency-chart-svg" width={600} height={600} ref={node => this.node = node} />
    );
  }
}

export default IssueDependencyChart;
