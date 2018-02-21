import React, { Component } from 'react';
import './App.css';

const treeNames = [
  'birch',
  'cedar',
  'cypress',
  'elm',
  'holly',
  'jamun',
  'maple',
  'oak',
  'pine',
  'larch',
  'ash',
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeStatuses: [],
    }
  }

  async componentWillMount() {
    const res = await fetch('https://treestatus.mozilla-releng.net/trees2');
    const data = await res.json();
    this.updateTreeStatues(data.result);
  }

  updateTreeStatues(treeStatuses) {
    treeStatuses = treeStatuses
      .filter(({ tree }) => !tree.includes('comm-'))
      .filter(({ tree }) => !treeNames.includes(tree))
      .filter(({ tree }) => tree !== "mozilla-aurora");

    function treeScore({ tree }) {
      const knownScores = {
        try: 100,
        autoland: 90,
        'mozilla-inbound': 80,
        'mozilla-central': 70,
        'mozilla-beta': 60,
        'mozilla-release': 50,
        'nss-try': 30,
        nss: 20,
        graphics: 10,
      }

      if (tree.startsWith('mozilla-esr')) {
        return 40;
      }

      return knownScores[tree] || 50;
    }

    treeStatuses.sort((a, b) => treeScore(b) - treeScore(a));

    this.setState({ treeStatuses });
  }

  render() {
    const {treeStatuses} = this.state;
    return (
      <div className="App">
        <div className="tiles big">
          {treeStatuses.slice(0, 4).map(ts => <StatusTile key={ts.tree} {...ts} />)}
        </div>
        <div className="tiles small">
          {treeStatuses.slice(4).map(ts => <StatusTile key={ts.tree} {...ts} />)}
        </div>
      </div>
    );
  }
}

class StatusTile extends Component {
  render() {
    const {reason, status, tree} = this.props;
    let backgroundColor;
    switch (status) {
      case "open": {
        backgroundColor = '#5cb85c';
        break;
      }
      case "closed": {
        backgroundColor = '#d9534f';
        break;
      }
      case "approval required": {
        backgroundColor = '#f0ad4e';
        break;
      }
      default: {
        backgroundColor = '#aaaaaa';
      }
    }

    return (
      <div className="tile" style={{ backgroundColor }}>
        <h1>{tree}</h1>
        <h2>{status}</h2>
        {reason && <p>{reason}</p>}
      </div>
    )
  }
}

export default App;
