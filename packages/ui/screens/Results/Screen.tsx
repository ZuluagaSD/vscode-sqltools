import React from 'react';
import { WebviewMessageType } from '@sqltools/ui/lib/interfaces';
import Loading from '@sqltools/ui/components/Loading';
import QueryResult from './QueryResult';
import getVscode from '@sqltools/ui/lib/vscode';
import QueryResultsState from './State';
import '@sqltools/ui/sass/results.scss';
import { DatabaseInterface } from '@sqltools/core/plugin-api';

export default class ResultsScreen extends React.Component<{}, QueryResultsState> {
  state: QueryResultsState = { connId: null, isLoaded: false, resultMap: {}, queries: [], error: null, activeTab: null };

  saveState = (data, cb = () => {}) => {
    this.setState(data, () => {
      cb();
      getVscode().setState(this.state);
    });
  }

  componentWillMount() {
    window.addEventListener('message', (ev) => {
      return this.messagesHandler(ev.data as WebviewMessageType);
    });
  }

  toggle(query: QueryResultsState['queries'][number]) {
    this.saveState({
      activeTab: query,
    });
  }

  messagesHandler = ({ action, payload }: WebviewMessageType<any>) => {
    console.log('Message received', {action, payload});
    switch (action) {
      case 'queryResults':
        const results: DatabaseInterface.QueryResults[] = payload;
        const queries = [];
        const resultMap = {};
        let connId: string;
        (Array.isArray(results) ? results : [results]).forEach((r) => {
          connId = r.connId;
          queries.push(r.query);
          resultMap[r.query] = r;
        });
        this.saveState({
          connId,
          isLoaded: true,
          queries,
          resultMap,
          error: null,
          activeTab: queries[0],
        });
        break;
      case 'reset':
        this.saveState({ connId: null, isLoaded: false, resultMap: {}, queries: [] });
        break;

      case 'getState':
        getVscode().postMessage({ action: 'receivedState', payload: this.state });
        break;
      default:
        break;
    }
  }

  render() {
    if (!this.state.isLoaded) {
      return <Loading active />;
    } else if (this.state.isLoaded && this.state.error) {
      return (
        <div>
          <h2>Query errored. Check the logs.</h2>
          <h4>{this.state.error.toString()}</h4>
        </div>
      );
    }
    const tabs = this.state.queries.map((query: string) => (
      <li
        title={query}
        key={query}
        onClick={() => this.toggle(query)}
        className={'truncate ' + (this.state.activeTab === query ? 'active' : '')}
      >
        {(this.state.resultMap[query] &&  this.state.resultMap[query].label) || query}
      </li>
    ));

    return (
      <div className='query-results-container fullscreen-container'>
        <ul className='tabs'>{tabs}</ul>
        <QueryResult
          {...this.state.resultMap[this.state.activeTab]}
        />
      </div>
    );
  }
}
