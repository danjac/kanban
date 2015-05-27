import React from 'react';

export default (Component, props, stubs) => {
    function RouterStub() {}

    Object.assign(RouterStub, {
        makePath () {},
        makeHref () {},
        transitionTo () {},
        replaceWith () {},
        goBack () {},
        getCurrentPath () {},
        getCurrentRoutes () {},
        getCurrentPathname () {},
        getCurrentParams () {},
        getCurrentQuery () {},
        isActive () {}
    }, stubs);

    return React.createClass({
        childContextTypes: {
          router: React.PropTypes.func
        },

        getChildContext () {
            return {
                router: RouterStub
            };
        },

        render () {
            return <Component {...props} />;
        }
    });

};
