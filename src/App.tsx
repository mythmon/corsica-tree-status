import React, { ReactNode, Component } from "react";
import cx from "classnames";
import "./App.css";

const realTreeNames = [
  "ash",
  "birch",
  "cedar",
  "cypress",
  "elm",
  "holly",
  "jamun",
  "larch",
  "maple",
  "oak",
  "pine",
];

/**
 * Try and guess if the page is being shown in Corsica currently.
 */
function probablyInCorsica(): boolean {
  // Corsica puts pages in iframes. Cross origin iframe children can't
  // access certain properties of their parents. If this seems to be
  // the case, assume that we are being loaded by Corsica.
  try {
    window.parent.location.toString();
    // if the above does  not throw, not in an iframe
  } catch (err) {
    if (err.name === "SecurityError" && err.message.includes("toString")) {
      // This is the error we are looking for.
      return true;
    }
  }
  // This doesn't look like corsica
  return false;
}

// If the shown statuses match these expected statuses, it is boring.
const expectedStatuses: Map<string, string> = new Map(
  Object.entries({
    ash: "open",
    autoland: "open",
    birch: "open",
    cedar: "open",
    "comm-aurora-seamonkey": "closed",
    "comm-aurora-thunderbird": "closed",
    "comm-beta-seamonkey": "approval required",
    "comm-beta-thunderbird": "approval required",
    "comm-central-seamonkey": "open",
    "comm-central-thunderbird": "open",
    "comm-esr45-thunderbird": "approval required",
    "comm-esr52-seamonkey": "approval required",
    "comm-esr52-thunderbird": "approval required",
    "comm-release-seamonkey": "approval required",
    "comm-release-thunderbird": "approval required",
    cypress: "open",
    elm: "open",
    graphics: "open",
    holly: "open",
    jamun: "open",
    larch: "open",
    maple: "open",
    "mozilla-aurora": "closed",
    "mozilla-beta": "approval required",
    "mozilla-central": "approval required",
    "mozilla-esr52": "closed",
    "mozilla-esr60": "approval required",
    "mozilla-esr68": "approval required",
    "mozilla-inbound": "open",
    "mozilla-release": "approval required",
    nss: "open",
    "nss-try": "open",
    oak: "open",
    pine: "open",
    "try-comm-central": "open",
    try: "open",
  }),
);

type TreeStatus = {
  tree: string;
  status: string;
  reason: string;
};

class App extends Component<{}, { treeStatuses: Array<TreeStatus> }> {
  constructor(props: {}) {
    super(props);
    this.state = {
      treeStatuses: [],
    };
  }

  async componentWillMount(): Promise<void> {
    const res = await fetch("https://treestatus.mozilla-releng.net/trees2");
    const data = await res.json();
    this.updateTreeStatues(data.result);
  }

  updateTreeStatues(treeStatuses: Array<TreeStatus>): void {
    treeStatuses = treeStatuses
      .filter(({ tree }) => !tree.includes("comm-"))
      .filter(({ tree }) => !realTreeNames.includes(tree))
      .filter(({ tree }) => tree !== "mozilla-aurora");

    function treeScore({ tree }: { tree: string }): number {
      const knownScores: Map<string, number> = new Map(
        Object.entries({
          try: 100,
          autoland: 90,
          "mozilla-inbound": 80,
          "mozilla-central": 70,
          "mozilla-beta": 65,
          "mozilla-release": 60,
          "nss-try": 30,
          nss: 20,
          graphics: 10,
        }),
      );

      if (tree.includes("esr")) {
        return 40;
      }

      return knownScores.get(tree) || 50;
    }

    treeStatuses.sort((a, b) => treeScore(b) - treeScore(a));

    const url = new URL(document.location.toString());
    const interesting = treeStatuses.filter(
      ts => expectedStatuses.get(ts.tree) !== ts.status,
    );
    console.log("Interesting statuses:", interesting);
    if (
      url.searchParams.get("force") === null &&
      probablyInCorsica() &&
      !interesting.length
    ) {
      // There isn't anything interesting here, so try and ask
      // Corsica to advance to the next page. Delay setting the tree
      // statuses for a moment, to avoid flickering content while
      // changing to the next page. Still load the content
      // eventually, in case we are wrong about being in Corsica, or
      // the reset message isn't received for some reason.
      console.log("Nothing is interesting, and in Corsica. Trying to skip.");
      setTimeout(() => this.setState({ treeStatuses }), 1000);
      window.parent.postMessage(
        {
          corsica: true,
          message: "reset",
        },
        "*",
      );
      return;
    }

    this.setState({ treeStatuses });
  }

  render(): ReactNode {
    const { treeStatuses } = this.state;
    const cutPoint = 2;
    return (
      <div className="App">
        <div className="tiles">
          {treeStatuses.slice(0, cutPoint).map(ts => (
            <StatusTile key={ts.tree} {...ts} />
          ))}
          {treeStatuses.slice(cutPoint).map(ts => (
            <StatusTile className="small" key={ts.tree} {...ts} />
          ))}
        </div>
      </div>
    );
  }
}

type StatusTileProps = {
  reason: string;
  status: string;
  tree: string;
  className?: string;
};

class StatusTile extends Component<StatusTileProps, {}> {
  render(): ReactNode {
    const { reason, status, tree, className } = this.props;
    let backgroundColor;
    switch (status) {
      case "open": {
        backgroundColor = "#5cb85c";
        break;
      }
      case "closed": {
        backgroundColor = "#d9534f";
        break;
      }
      case "approval required": {
        backgroundColor = "#f0ad4e";
        break;
      }
      default: {
        backgroundColor = "#aaaaaa";
      }
    }

    let interestingness;
    if (expectedStatuses.has(tree)) {
      if (expectedStatuses.get(tree) === status) {
        interestingness = null;
      } else {
        interestingness = "!";
      }
    } else {
      interestingness = "?";
    }

    return (
      <div className={cx("tile", className)} style={{ backgroundColor }}>
        <h1>{tree}</h1>
        <h2>{status}</h2>
        {reason && <p>{reason}</p>}
        <div className="interestingness">{interestingness}</div>
      </div>
    );
  }
}

export default App;
