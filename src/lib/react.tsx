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


export interface SubscribeDecoratorOptions {
  fields?: string[];
  mapState?: (state: any) => any;
  mapStore?: string;
}

function emptyFunction() { /**/ }

function getStoreFromComponentInstance(thisArgs: any): Store {
  return thisArgs.context[CONTEXT_NAME] && thisArgs.context[CONTEXT_NAME].store;
}

function ensureConsturctor(constructor: any) {
  if (constructor.__holyhi__) {
    throw new Error(`cannot use @subscribe() and @mapStore() in the same time`);
  }
  constructor.__holyhi__ = true;
}

export function subscribe(options: SubscribeDecoratorOptions) {
  const fields = options.fields || [];
  const mapState = options.mapState || ((s) => s);
  const mapStore = options.mapStore || '__holyhi__store';

  return function (constructor: any) {
    ensureConsturctor(constructor);

    constructor.contextTypes = {
      ...constructor.contextTypes,
      [CONTEXT_NAME]: PropTypes.object.isRequired,
    };

    constructor.prototype.componentWillMount = constructor.prototype.componentWillMount || emptyFunction;
    constructor.prototype.__hohyhi__componentWillMount = constructor.prototype.componentWillMount;
    constructor.prototype.componentWillMount = function () {
      const store = getStoreFromComponentInstance(this);
      if (store) {
        this[mapStore] = store;
        this.__holyhi__subscribe = store.subscribe(fields, () => this.setState(mapState(store.getState()))).emit();
      }
    };

    constructor.prototype.componentWillUnmount = constructor.prototype.componentWillUnmount || emptyFunction;
    constructor.prototype.__hohyhi__componentWillUnmount = constructor.prototype.componentWillUnmount;
    constructor.prototype.componentWillUnmount = function () {
      if (this.__holyhi__subscribe) {
        this.__holyhi__subscribe.unsubscribe();
      }
    };

    return constructor;
  };
}

export function mapStore(name: string = '__holyhi__store') {
  return function (constructor: any) {
    ensureConsturctor(constructor);

    constructor.contextTypes = {
      ...constructor.contextTypes,
      [CONTEXT_NAME]: PropTypes.object.isRequired,
    };

    constructor.prototype.componentWillMount = constructor.prototype.componentWillMount || emptyFunction;
    constructor.prototype.__hohyhi__componentWillMount = constructor.prototype.componentWillMount;
    constructor.prototype.componentWillMount = function () {
      const store = getStoreFromComponentInstance(this);
      if (store) {
        this[name] = store;
      }
    };

    return constructor;
  };
}
