import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Store, Subscriber } from './store';

export const CONTEXT_NAME = '__holyhi__';

export interface ProviderComponentProps {
  store: Store;
}

export class Provider extends React.Component<ProviderComponentProps> {

  public static propTypes: any = {
    store: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
  };

  public static childContextTypes: any = {
    [CONTEXT_NAME]: PropTypes.object.isRequired,
  };

  public getChildContext() {
    return {
      [CONTEXT_NAME]: {
        store: this.props.store,
      },
    };
  }

  public render() {
    const children = this.props.children;
    return (Array.isArray(children) ? children[0] : children) as JSX.Element;
  }

}

export interface StateComponentProps {
  noSubscribe?: boolean;
  subscribe?: string[];
  render(state: any, store: Store): JSX.Element;
}

export class State extends React.Component<StateComponentProps> {

  public static contextTypes: any = {
    [CONTEXT_NAME]: PropTypes.object.isRequired,
  };

  public static propTypes: any = {
    noSubscribe: PropTypes.bool,
    subscribe: PropTypes.arrayOf(PropTypes.string),
    render: PropTypes.func.isRequired,
  };

  public static defaultProps: any = {
    noSubscribe: false,
    subscribe: [],
  };

  public store: Store;
  private subscriber: Subscriber;

  constructor(props: StateComponentProps, context: any) {
    super(props, context);
    this.store = context[CONTEXT_NAME] && context[CONTEXT_NAME].store;
    if (!this.store) {
      throw new TypeError(`please use <State /> in <Provider></Provider>`);
    }
  }

  public componentWillMount() {
    if (!this.props.noSubscribe) {
      this.subscriber = this.store.subscribe(this.props.subscribe || [], () => {
        this.setState(this.store.getState());
      });
    }
  }

  public componentWillUnmount() {
    if (this.subscriber && this.subscriber.listening) {
      this.subscriber.unsubscribe();
    }
  }

  public componentWillReceiveProps(nextProps: StateComponentProps) {
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
    if (!nextProps.noSubscribe) {
      this.subscriber = this.store.subscribe(nextProps.subscribe || [], () => {
        this.setState(this.store.getState());
      });
    }
  }

  public render() {
    return this.props.render(this.store.getState(), this.store);
  }

}
