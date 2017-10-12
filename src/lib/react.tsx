import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Store } from './store';

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

export interface ConnectDecoratorOptions {
  subscribe?: string[];
  mapState?: (state: any) => any;
  mapStore?: string;
}

function emptyFunction() { /**/ }

function getStoreFromComponentInstance(thisArg: any): Store {
  return thisArg.context[CONTEXT_NAME] && thisArg.context[CONTEXT_NAME].store;
}

function ensureConsturctor(constructor: any) {
  if (constructor.__holyhi__) {
    throw new Error(`cannot use @connect twice`);
  }
  constructor.__holyhi__ = true;
}

export function connect(options: ConnectDecoratorOptions) {
  const enableSubscribe = Array.isArray(options.subscribe);
  const fields = (enableSubscribe ? options.subscribe : []) as string[];
  const mapState = options.mapState || ((s) => s);
  const mapStore = options.mapStore || '__holyhi__store';

  return function (constructor: any) {
    ensureConsturctor(constructor);

    constructor.contextTypes = {
      ...constructor.contextTypes,
      [CONTEXT_NAME]: PropTypes.object.isRequired,
    };

    constructor.prototype.componentWillMount = constructor.prototype.componentWillMount || emptyFunction;
    constructor.prototype.__hohyhi__origin_componentWillMount = constructor.prototype.componentWillMount;
    constructor.prototype.componentWillMount = function () {
      const store = getStoreFromComponentInstance(this);
      if (store) {
        this[mapStore] = store;
        if (enableSubscribe) {
          this.__holyhi__observer = store.subscribe(fields, () => this.setState(mapState(store.getState()))).emit();
        }
      }
      this.__hohyhi__origin_componentWillMount();
    };

    constructor.prototype.componentWillUnmount = constructor.prototype.componentWillUnmount || emptyFunction;
    constructor.prototype.__hohyhi__origin_componentWillUnmount = constructor.prototype.componentWillUnmount;
    constructor.prototype.componentWillUnmount = function () {
      if (this.__holyhi__observer) {
        this.__holyhi__observer.unsubscribe();
      }
      this.__hohyhi__origin_componentWillUnmount();
    };

    return constructor;
  };
}
