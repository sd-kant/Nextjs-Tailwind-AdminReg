export const GlobalDebug = (function () {
  const savedConsole = console;
  /**
   * @param {boolean} debugOn
   * @param {boolean} suppressAll
   */
  return function (debugOn, suppressAll) {
    const suppress = suppressAll || false;
    if (debugOn === false) {
      // suppress the default console functionality
      // eslint-disable-next-line no-global-assign
      console = {};
      console.log = function () {};
      // suppress all type of consoles
      if (suppress) {
        console.info = function () {};
        console.warn = function () {};
        console.error = function () {};
      } else {
        console.info = savedConsole.info;
        console.warn = savedConsole.warn;
        console.error = savedConsole.error;
      }
    } else {
      // eslint-disable-next-line no-global-assign
      console = savedConsole;
    }
  };
})();
