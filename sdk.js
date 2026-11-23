/* Dummy ad SDK replacement.
 * No ad requests, network calls, tracking, storage, or GameMonetize integration.
 */
(function (global) {
  "use strict";

  function createEventBus() {
    var listeners = Object.create(null);

    return {
      subscribe: function (name, callback) {
        if (typeof callback !== "function") return;
        (listeners[name] || (listeners[name] = [])).push(callback);
      },
      broadcast: function (name, payload) {
        (listeners[name] || []).slice().forEach(function (callback) {
          try {
            callback(payload || { name: name });
          } catch (error) {
            if (global.console && console.error) console.error(error);
          }
        });
      }
    };
  }

  function DummySDK(options) {
    if (global.sdk instanceof DummySDK) return global.sdk;

    this.options = Object.assign({
      debug: false,
      testing: false,
      gameId: "",
      prefix: "sdk__",
      flashSettings: {},
      advertisementSettings: {},
      resumeGame: function () {},
      pauseGame: function () {},
      onEvent: function () {},
      onInit: function () {},
      onError: function () {}
    }, options || {});

    this.eventBus = createEventBus();
    this.eventBus.gameId = String(this.options.gameId || "");

    this.videoAdInstance = {
      requestAttempts: 0,
      requestAd: function () {},
      cancel: function () {}
    };

    this._started = false;
  }

  DummySDK.prototype._emit = function (name, message, status) {
    var event = {
      name: name,
      message: message || "",
      status: status || "success"
    };

    this.eventBus.broadcast(name, event);

    try {
      this.options.onEvent(event);
    } catch (error) {
      if (global.console && console.error) console.error(error);
    }

    return event;
  };

  DummySDK.prototype.onResumeGame = function (message, status) {
    try {
      this.options.resumeGame();
    } catch (error) {
      if (global.console && console.error) console.error(error);
    }

    this._emit(
      "SDK_GAME_START",
      message || "Game resumed (dummy ad SDK).",
      status
    );
  };

  DummySDK.prototype.onPauseGame = function (message, status) {
    try {
      this.options.pauseGame();
    } catch (error) {
      if (global.console && console.error) console.error(error);
    }

    this._emit(
      "SDK_GAME_PAUSE",
      message || "Ad pause requested (dummy ad SDK).",
      status
    );

    // Immediately resume instead of showing an advertisement.
    this.onResumeGame(
      "Dummy ad skipped; resume the game.",
      "success"
    );
  };

  DummySDK.prototype.start = function () {
    if (this._started) return this;

    this._started = true;

    this._emit(
      "SDK_READY",
      "Dummy SDK ready; ads are disabled.",
      "success"
    );

    try {
      this.options.onInit("Dummy SDK ready; ads are disabled.");
    } catch (error) {
      if (global.console && console.error) console.error(error);
    }

    return this;
  };

  DummySDK.prototype.showBanner = function () {
    this.onResumeGame("No ad shown; game continues.", "success");
  };

  DummySDK.prototype.play = function () {};
  DummySDK.prototype.customLog = function () {};
  DummySDK.prototype.openConsole = function () {};

  DummySDK.prototype.requestAd = function () {
    this.onResumeGame("No ad shown; game continues.", "success");
  };

  DummySDK.prototype.loadAd = function () {
    this.onResumeGame("No ad loaded; game continues.", "success");
  };

  DummySDK.prototype.cancel = function () {
    this.onResumeGame("Ad cancelled; game continues.", "success");
  };

  global.sdk = new DummySDK(global.SDK_OPTIONS || {});
  global.gdApi = global.sdk;
  global.DummyAdSDK = DummySDK;

})(typeof window !== "undefined" ? window : globalThis);