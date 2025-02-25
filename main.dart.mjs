
// Compiles a dart2wasm-generated main module from `source` which can then
// instantiatable via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm modules from `bytes` which is then
// instantiatable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export async function instantiate(modulePromise, importObjectPromise) {
  var moduleOrCompiledApp = await modulePromise;
  if (!(moduleOrCompiledApp instanceof CompiledApp)) {
    moduleOrCompiledApp = new CompiledApp(moduleOrCompiledApp);
  }
  const instantiatedApp = await moduleOrCompiledApp.instantiate(await importObjectPromise);
  return instantiatedApp.instantiatedModule;
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export const invoke = (moduleInstance, ...args) => {
  moduleInstance.exports.$invokeMain(args);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredWasm` is a JS function that takes a module name matching a
  //   wasm file produced by the dart2wasm compiler and returns the bytes to
  //   load the module. These bytes can be in either a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  async instantiate(additionalImports, {loadDeferredWasm} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + js;
    }

    // Converts a Dart List to a JS array. Any Dart objects will be converted, but
    // this will be cheap for JSValues.
    function arrayFromDartList(constructor, list) {
      const exports = dartInstance.exports;
      const read = exports.$listRead;
      const length = exports.$listLength(list);
      const array = new constructor(length);
      for (let i = 0; i < length; i++) {
        array[i] = read(list, i);
      }
      return array;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {

      _1: (x0,x1,x2) => x0.set(x1,x2),
      _2: (x0,x1,x2) => x0.set(x1,x2),
      _3: (x0,x1) => x0.transferFromImageBitmap(x1),
      _4: x0 => x0.arrayBuffer(),
      _5: (x0,x1) => x0.transferFromImageBitmap(x1),
      _6: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._6(f,arguments.length,x0) }),
      _7: x0 => new window.FinalizationRegistry(x0),
      _8: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      _9: (x0,x1) => x0.unregister(x1),
      _10: (x0,x1,x2) => x0.slice(x1,x2),
      _11: (x0,x1) => x0.decode(x1),
      _12: (x0,x1) => x0.segment(x1),
      _13: () => new TextDecoder(),
      _14: x0 => x0.buffer,
      _15: x0 => x0.wasmMemory,
      _16: () => globalThis.window._flutter_skwasmInstance,
      _17: x0 => x0.rasterStartMilliseconds,
      _18: x0 => x0.rasterEndMilliseconds,
      _19: x0 => x0.imageBitmaps,
      _192: x0 => x0.select(),
      _193: (x0,x1) => x0.append(x1),
      _194: x0 => x0.remove(),
      _197: x0 => x0.unlock(),
      _202: x0 => x0.getReader(),
      _211: x0 => new MutationObserver(x0),
      _220: (x0,x1) => new OffscreenCanvas(x0,x1),
      _222: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _223: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      _226: x0 => new ResizeObserver(x0),
      _229: (x0,x1) => new Intl.Segmenter(x0,x1),
      _230: x0 => x0.next(),
      _231: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      _308: x0 => x0.close(),
      _309: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      _310: x0 => new window.ImageDecoder(x0),
      _311: x0 => x0.close(),
      _312: x0 => ({frameIndex: x0}),
      _313: (x0,x1) => x0.decode(x1),
      _316: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._316(f,arguments.length,x0) }),
      _317: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._317(f,arguments.length,x0) }),
      _318: (x0,x1) => ({addView: x0,removeView: x1}),
      _319: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._319(f,arguments.length,x0) }),
      _320: f => finalizeWrapper(f, function() { return dartInstance.exports._320(f,arguments.length) }),
      _321: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      _322: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._322(f,arguments.length,x0) }),
      _323: x0 => ({runApp: x0}),
      _324: x0 => new Uint8Array(x0),
      _326: x0 => x0.preventDefault(),
      _327: x0 => x0.stopPropagation(),
      _328: (x0,x1) => x0.addListener(x1),
      _329: (x0,x1) => x0.removeListener(x1),
      _330: (x0,x1) => x0.prepend(x1),
      _331: x0 => x0.remove(),
      _332: x0 => x0.disconnect(),
      _333: (x0,x1) => x0.addListener(x1),
      _334: (x0,x1) => x0.removeListener(x1),
      _335: x0 => x0.blur(),
      _336: (x0,x1) => x0.append(x1),
      _337: x0 => x0.remove(),
      _338: x0 => x0.stopPropagation(),
      _342: x0 => x0.preventDefault(),
      _343: (x0,x1) => x0.append(x1),
      _344: x0 => x0.remove(),
      _345: x0 => x0.preventDefault(),
      _350: (x0,x1) => x0.removeChild(x1),
      _351: (x0,x1) => x0.appendChild(x1),
      _352: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _353: (x0,x1) => x0.appendChild(x1),
      _354: (x0,x1) => x0.transferFromImageBitmap(x1),
      _355: (x0,x1) => x0.appendChild(x1),
      _356: (x0,x1) => x0.append(x1),
      _357: (x0,x1) => x0.append(x1),
      _358: (x0,x1) => x0.append(x1),
      _359: x0 => x0.remove(),
      _360: x0 => x0.remove(),
      _361: x0 => x0.remove(),
      _362: (x0,x1) => x0.appendChild(x1),
      _363: (x0,x1) => x0.appendChild(x1),
      _364: x0 => x0.remove(),
      _365: (x0,x1) => x0.append(x1),
      _366: (x0,x1) => x0.append(x1),
      _367: x0 => x0.remove(),
      _368: (x0,x1) => x0.append(x1),
      _369: (x0,x1) => x0.append(x1),
      _370: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _371: (x0,x1) => x0.append(x1),
      _372: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _373: x0 => x0.remove(),
      _374: (x0,x1) => x0.append(x1),
      _375: x0 => x0.remove(),
      _376: (x0,x1) => x0.append(x1),
      _377: x0 => x0.remove(),
      _378: x0 => x0.remove(),
      _379: x0 => x0.getBoundingClientRect(),
      _380: x0 => x0.remove(),
      _393: (x0,x1) => x0.append(x1),
      _394: x0 => x0.remove(),
      _395: (x0,x1) => x0.append(x1),
      _396: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _397: x0 => x0.preventDefault(),
      _398: x0 => x0.preventDefault(),
      _399: x0 => x0.preventDefault(),
      _400: x0 => x0.preventDefault(),
      _401: (x0,x1) => x0.observe(x1),
      _402: x0 => x0.disconnect(),
      _403: (x0,x1) => x0.appendChild(x1),
      _404: (x0,x1) => x0.appendChild(x1),
      _405: (x0,x1) => x0.appendChild(x1),
      _406: (x0,x1) => x0.append(x1),
      _407: x0 => x0.remove(),
      _408: (x0,x1) => x0.append(x1),
      _409: (x0,x1) => x0.append(x1),
      _410: (x0,x1) => x0.appendChild(x1),
      _411: (x0,x1) => x0.append(x1),
      _412: x0 => x0.remove(),
      _413: (x0,x1) => x0.append(x1),
      _414: x0 => x0.remove(),
      _418: (x0,x1) => x0.appendChild(x1),
      _419: x0 => x0.remove(),
      _978: () => globalThis.window.flutterConfiguration,
      _979: x0 => x0.assetBase,
      _984: x0 => x0.debugShowSemanticsNodes,
      _985: x0 => x0.hostElement,
      _986: x0 => x0.multiViewEnabled,
      _987: x0 => x0.nonce,
      _989: x0 => x0.fontFallbackBaseUrl,
      _995: x0 => x0.console,
      _996: x0 => x0.devicePixelRatio,
      _997: x0 => x0.document,
      _998: x0 => x0.history,
      _999: x0 => x0.innerHeight,
      _1000: x0 => x0.innerWidth,
      _1001: x0 => x0.location,
      _1002: x0 => x0.navigator,
      _1003: x0 => x0.visualViewport,
      _1004: x0 => x0.performance,
      _1007: (x0,x1) => x0.dispatchEvent(x1),
      _1008: (x0,x1) => x0.matchMedia(x1),
      _1010: (x0,x1) => x0.getComputedStyle(x1),
      _1011: x0 => x0.screen,
      _1012: (x0,x1) => x0.requestAnimationFrame(x1),
      _1013: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1013(f,arguments.length,x0) }),
      _1018: (x0,x1) => x0.warn(x1),
      _1020: (x0,x1) => x0.debug(x1),
      _1021: () => globalThis.window,
      _1022: () => globalThis.Intl,
      _1023: () => globalThis.Symbol,
      _1026: x0 => x0.clipboard,
      _1027: x0 => x0.maxTouchPoints,
      _1028: x0 => x0.vendor,
      _1029: x0 => x0.language,
      _1030: x0 => x0.platform,
      _1031: x0 => x0.userAgent,
      _1032: x0 => x0.languages,
      _1033: x0 => x0.documentElement,
      _1034: (x0,x1) => x0.querySelector(x1),
      _1038: (x0,x1) => x0.createElement(x1),
      _1039: (x0,x1) => x0.execCommand(x1),
      _1042: (x0,x1) => x0.createTextNode(x1),
      _1043: (x0,x1) => x0.createEvent(x1),
      _1047: x0 => x0.head,
      _1048: x0 => x0.body,
      _1049: (x0,x1) => x0.title = x1,
      _1052: x0 => x0.activeElement,
      _1054: x0 => x0.visibilityState,
      _1056: x0 => x0.hasFocus(),
      _1057: () => globalThis.document,
      _1058: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1059: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1062: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1062(f,arguments.length,x0) }),
      _1063: x0 => x0.target,
      _1065: x0 => x0.timeStamp,
      _1066: x0 => x0.type,
      _1068: x0 => x0.preventDefault(),
      _1070: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      _1077: x0 => x0.firstChild,
      _1082: x0 => x0.parentElement,
      _1084: x0 => x0.parentNode,
      _1088: (x0,x1) => x0.removeChild(x1),
      _1089: (x0,x1) => x0.removeChild(x1),
      _1090: x0 => x0.isConnected,
      _1091: (x0,x1) => x0.textContent = x1,
      _1095: (x0,x1) => x0.contains(x1),
      _1101: x0 => x0.firstElementChild,
      _1103: x0 => x0.nextElementSibling,
      _1104: x0 => x0.clientHeight,
      _1105: x0 => x0.clientWidth,
      _1106: x0 => x0.offsetHeight,
      _1107: x0 => x0.offsetWidth,
      _1108: x0 => x0.id,
      _1109: (x0,x1) => x0.id = x1,
      _1112: (x0,x1) => x0.spellcheck = x1,
      _1113: x0 => x0.tagName,
      _1114: x0 => x0.style,
      _1115: (x0,x1) => x0.append(x1),
      _1117: (x0,x1) => x0.getAttribute(x1),
      _1118: x0 => x0.getBoundingClientRect(),
      _1121: (x0,x1) => x0.closest(x1),
      _1124: (x0,x1) => x0.querySelectorAll(x1),
      _1126: x0 => x0.remove(),
      _1127: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _1128: (x0,x1) => x0.removeAttribute(x1),
      _1129: (x0,x1) => x0.tabIndex = x1,
      _1132: (x0,x1) => x0.focus(x1),
      _1133: x0 => x0.scrollTop,
      _1134: (x0,x1) => x0.scrollTop = x1,
      _1135: x0 => x0.scrollLeft,
      _1136: (x0,x1) => x0.scrollLeft = x1,
      _1137: x0 => x0.classList,
      _1138: (x0,x1) => x0.className = x1,
      _1144: (x0,x1) => x0.getElementsByClassName(x1),
      _1146: x0 => x0.click(),
      _1147: (x0,x1) => x0.hasAttribute(x1),
      _1150: (x0,x1) => x0.attachShadow(x1),
      _1155: (x0,x1) => x0.getPropertyValue(x1),
      _1157: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      _1159: (x0,x1) => x0.removeProperty(x1),
      _1161: x0 => x0.offsetLeft,
      _1162: x0 => x0.offsetTop,
      _1163: x0 => x0.offsetParent,
      _1165: (x0,x1) => x0.name = x1,
      _1166: x0 => x0.content,
      _1167: (x0,x1) => x0.content = x1,
      _1185: (x0,x1) => x0.nonce = x1,
      _1191: x0 => x0.now(),
      _1193: (x0,x1) => x0.width = x1,
      _1195: (x0,x1) => x0.height = x1,
      _1199: (x0,x1) => x0.getContext(x1),
      _1270: x0 => x0.width,
      _1271: x0 => x0.height,
      _1275: (x0,x1) => x0.fetch(x1),
      _1276: x0 => x0.status,
      _1277: x0 => x0.headers,
      _1278: x0 => x0.body,
      _1279: x0 => x0.arrayBuffer(),
      _1282: (x0,x1) => x0.get(x1),
      _1285: x0 => x0.read(),
      _1286: x0 => x0.value,
      _1287: x0 => x0.done,
      _1289: x0 => x0.name,
      _1290: x0 => x0.x,
      _1291: x0 => x0.y,
      _1294: x0 => x0.top,
      _1295: x0 => x0.right,
      _1296: x0 => x0.bottom,
      _1297: x0 => x0.left,
      _1306: x0 => x0.height,
      _1307: x0 => x0.width,
      _1308: (x0,x1) => x0.value = x1,
      _1310: (x0,x1) => x0.placeholder = x1,
      _1311: (x0,x1) => x0.name = x1,
      _1312: x0 => x0.selectionDirection,
      _1313: x0 => x0.selectionStart,
      _1314: x0 => x0.selectionEnd,
      _1317: x0 => x0.value,
      _1319: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1322: x0 => x0.readText(),
      _1323: (x0,x1) => x0.writeText(x1),
      _1324: x0 => x0.altKey,
      _1325: x0 => x0.code,
      _1326: x0 => x0.ctrlKey,
      _1327: x0 => x0.key,
      _1328: x0 => x0.keyCode,
      _1329: x0 => x0.location,
      _1330: x0 => x0.metaKey,
      _1331: x0 => x0.repeat,
      _1332: x0 => x0.shiftKey,
      _1333: x0 => x0.isComposing,
      _1334: (x0,x1) => x0.getModifierState(x1),
      _1336: x0 => x0.state,
      _1337: (x0,x1) => x0.go(x1),
      _1339: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      _1341: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      _1342: x0 => x0.pathname,
      _1343: x0 => x0.search,
      _1344: x0 => x0.hash,
      _1348: x0 => x0.state,
      _1356: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1356(f,arguments.length,x0,x1) }),
      _1358: (x0,x1,x2) => x0.observe(x1,x2),
      _1361: x0 => x0.attributeName,
      _1362: x0 => x0.type,
      _1363: x0 => x0.matches,
      _1366: x0 => x0.matches,
      _1368: x0 => x0.relatedTarget,
      _1369: x0 => x0.clientX,
      _1370: x0 => x0.clientY,
      _1371: x0 => x0.offsetX,
      _1372: x0 => x0.offsetY,
      _1375: x0 => x0.button,
      _1376: x0 => x0.buttons,
      _1377: x0 => x0.ctrlKey,
      _1378: (x0,x1) => x0.getModifierState(x1),
      _1381: x0 => x0.pointerId,
      _1382: x0 => x0.pointerType,
      _1383: x0 => x0.pressure,
      _1384: x0 => x0.tiltX,
      _1385: x0 => x0.tiltY,
      _1386: x0 => x0.getCoalescedEvents(),
      _1388: x0 => x0.deltaX,
      _1389: x0 => x0.deltaY,
      _1390: x0 => x0.wheelDeltaX,
      _1391: x0 => x0.wheelDeltaY,
      _1392: x0 => x0.deltaMode,
      _1398: x0 => x0.changedTouches,
      _1400: x0 => x0.clientX,
      _1401: x0 => x0.clientY,
      _1403: x0 => x0.data,
      _1406: (x0,x1) => x0.disabled = x1,
      _1407: (x0,x1) => x0.type = x1,
      _1408: (x0,x1) => x0.max = x1,
      _1409: (x0,x1) => x0.min = x1,
      _1410: (x0,x1) => x0.value = x1,
      _1411: x0 => x0.value,
      _1412: x0 => x0.disabled,
      _1413: (x0,x1) => x0.disabled = x1,
      _1414: (x0,x1) => x0.placeholder = x1,
      _1415: (x0,x1) => x0.name = x1,
      _1416: (x0,x1) => x0.autocomplete = x1,
      _1417: x0 => x0.selectionDirection,
      _1418: x0 => x0.selectionStart,
      _1419: x0 => x0.selectionEnd,
      _1423: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1428: (x0,x1) => x0.add(x1),
      _1432: (x0,x1) => x0.noValidate = x1,
      _1433: (x0,x1) => x0.method = x1,
      _1434: (x0,x1) => x0.action = x1,
      _1440: (x0,x1) => x0.getContext(x1),
      _1442: x0 => x0.convertToBlob(),
      _1459: x0 => x0.orientation,
      _1460: x0 => x0.width,
      _1461: x0 => x0.height,
      _1462: (x0,x1) => x0.lock(x1),
      _1478: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1478(f,arguments.length,x0,x1) }),
      _1489: x0 => x0.length,
      _1491: (x0,x1) => x0.item(x1),
      _1492: x0 => x0.length,
      _1493: (x0,x1) => x0.item(x1),
      _1494: x0 => x0.iterator,
      _1495: x0 => x0.Segmenter,
      _1496: x0 => x0.v8BreakIterator,
      _1499: x0 => x0.done,
      _1500: x0 => x0.value,
      _1501: x0 => x0.index,
      _1505: (x0,x1) => x0.adoptText(x1),
      _1506: x0 => x0.first(),
      _1507: x0 => x0.next(),
      _1508: x0 => x0.current(),
      _1522: x0 => x0.hostElement,
      _1523: x0 => x0.viewConstraints,
      _1525: x0 => x0.maxHeight,
      _1526: x0 => x0.maxWidth,
      _1527: x0 => x0.minHeight,
      _1528: x0 => x0.minWidth,
      _1529: x0 => x0.loader,
      _1530: () => globalThis._flutter,
      _1531: (x0,x1) => x0.didCreateEngineInitializer(x1),
      _1532: (x0,x1,x2) => x0.call(x1,x2),
      _1533: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1533(f,arguments.length,x0,x1) }),
      _1534: x0 => new Promise(x0),
      _1537: x0 => x0.length,
      _1540: x0 => x0.tracks,
      _1544: x0 => x0.image,
      _1551: x0 => x0.displayWidth,
      _1552: x0 => x0.displayHeight,
      _1553: x0 => x0.duration,
      _1556: x0 => x0.ready,
      _1557: x0 => x0.selectedTrack,
      _1558: x0 => x0.repetitionCount,
      _1559: x0 => x0.frameCount,
      _1604: x0 => x0.decode(),
      _1605: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1606: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      _1607: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1607(f,arguments.length,x0) }),
      _1608: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _1609: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1609(f,arguments.length,x0) }),
      _1610: x0 => x0.send(),
      _1611: () => new XMLHttpRequest(),
      _1612: (x0,x1) => x0.createElement(x1),
      _1620: x0 => x0.toArray(),
      _1621: x0 => x0.toUint8Array(),
      _1622: x0 => ({serverTimestamps: x0}),
      _1623: x0 => ({source: x0}),
      _1626: x0 => new firebase_firestore.FieldPath(x0),
      _1627: (x0,x1) => new firebase_firestore.FieldPath(x0,x1),
      _1628: (x0,x1,x2) => new firebase_firestore.FieldPath(x0,x1,x2),
      _1629: (x0,x1,x2,x3) => new firebase_firestore.FieldPath(x0,x1,x2,x3),
      _1630: (x0,x1,x2,x3,x4) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4),
      _1631: (x0,x1,x2,x3,x4,x5) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4,x5),
      _1632: (x0,x1,x2,x3,x4,x5,x6) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4,x5,x6),
      _1633: (x0,x1,x2,x3,x4,x5,x6,x7) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4,x5,x6,x7),
      _1634: (x0,x1,x2,x3,x4,x5,x6,x7,x8) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4,x5,x6,x7,x8),
      _1635: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4,x5,x6,x7,x8,x9),
      _1636: () => globalThis.firebase_firestore.documentId(),
      _1637: (x0,x1) => new firebase_firestore.GeoPoint(x0,x1),
      _1638: x0 => globalThis.firebase_firestore.vector(x0),
      _1639: x0 => globalThis.firebase_firestore.Bytes.fromUint8Array(x0),
      _1641: (x0,x1) => globalThis.firebase_firestore.collection(x0,x1),
      _1643: (x0,x1) => globalThis.firebase_firestore.doc(x0,x1),
      _1648: x0 => x0.call(),
      _1679: x0 => globalThis.firebase_firestore.getDoc(x0),
      _1680: x0 => globalThis.firebase_firestore.getDocFromServer(x0),
      _1681: x0 => globalThis.firebase_firestore.getDocFromCache(x0),
      _1688: (x0,x1) => globalThis.firebase_firestore.setDoc(x0,x1),
      _1714: (x0,x1) => x0.data(x1),
      _1736: (x0,x1) => globalThis.firebase_firestore.getFirestore(x0,x1),
      _1738: x0 => globalThis.firebase_firestore.Timestamp.fromMillis(x0),
      _1739: x0 => globalThis.firebase_firestore.Timestamp.fromMillis(x0),
      _1740: f => finalizeWrapper(f, function() { return dartInstance.exports._1740(f,arguments.length) }),
      _1810: x0 => x0.path,
      _1814: () => globalThis.firebase_firestore.GeoPoint,
      _1815: x0 => x0.latitude,
      _1816: x0 => x0.longitude,
      _1818: () => globalThis.firebase_firestore.VectorValue,
      _1821: () => globalThis.firebase_firestore.Bytes,
      _1833: () => globalThis.firebase_firestore.DocumentReference,
      _1837: x0 => x0.path,
      _1847: x0 => x0.metadata,
      _1848: x0 => x0.ref,
      _1866: () => globalThis.firebase_firestore.Timestamp,
      _1867: x0 => x0.seconds,
      _1868: x0 => x0.nanoseconds,
      _1905: x0 => x0.hasPendingWrites,
      _1907: x0 => x0.fromCache,
      _1914: x0 => x0.source,
      _1933: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _1934: (x0,x1) => x0.createElement(x1),
      _1941: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      _1945: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1957: (x0,x1) => x0.querySelector(x1),
      _1958: (x0,x1) => x0.getAttribute(x1),
      _1959: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _1970: (x0,x1) => x0.initialize(x1),
      _1971: (x0,x1) => x0.initTokenClient(x1),
      _1972: (x0,x1) => x0.initCodeClient(x1),
      _1974: (x0,x1) => x0.warn(x1),
      _1975: x0 => x0.disableAutoSelect(),
      _1976: x0 => x0.delete(),
      _1978: (x0,x1) => globalThis.firebase_auth.linkWithCredential(x0,x1),
      _1979: (x0,x1,x2) => globalThis.firebase_auth.linkWithPhoneNumber(x0,x1,x2),
      _1986: x0 => x0.reload(),
      _1987: (x0,x1) => globalThis.firebase_auth.sendEmailVerification(x0,x1),
      _1989: (x0,x1) => globalThis.firebase_auth.unlink(x0,x1),
      _1993: (x0,x1) => globalThis.firebase_auth.updateProfile(x0,x1),
      _1996: x0 => x0.toJSON(),
      _1997: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1997(f,arguments.length,x0) }),
      _1998: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1998(f,arguments.length,x0) }),
      _1999: (x0,x1,x2) => x0.onAuthStateChanged(x1,x2),
      _2000: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2000(f,arguments.length,x0) }),
      _2001: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2001(f,arguments.length,x0) }),
      _2002: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2002(f,arguments.length,x0) }),
      _2003: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2003(f,arguments.length,x0) }),
      _2004: (x0,x1,x2) => x0.onIdTokenChanged(x1,x2),
      _2005: (x0,x1) => globalThis.firebase_auth.applyActionCode(x0,x1),
      _2006: (x0,x1) => globalThis.firebase_auth.checkActionCode(x0,x1),
      _2008: (x0,x1,x2) => globalThis.firebase_auth.createUserWithEmailAndPassword(x0,x1,x2),
      _2014: (x0,x1,x2) => globalThis.firebase_auth.sendPasswordResetEmail(x0,x1,x2),
      _2015: (x0,x1) => globalThis.firebase_auth.signInWithCredential(x0,x1),
      _2020: (x0,x1,x2) => globalThis.firebase_auth.signInWithPhoneNumber(x0,x1,x2),
      _2023: x0 => x0.signOut(),
      _2024: (x0,x1) => globalThis.firebase_auth.connectAuthEmulator(x0,x1),
      _2028: (x0,x1) => globalThis.firebase_auth.EmailAuthProvider.credential(x0,x1),
      _2041: (x0,x1) => globalThis.firebase_auth.GoogleAuthProvider.credential(x0,x1),
      _2042: x0 => new firebase_auth.OAuthProvider(x0),
      _2045: (x0,x1) => x0.credential(x1),
      _2046: x0 => globalThis.firebase_auth.OAuthProvider.credentialFromResult(x0),
      _2052: x0 => new firebase_auth.PhoneAuthProvider(x0),
      _2053: () => new firebase_auth.PhoneAuthProvider(),
      _2054: (x0,x1,x2) => x0.verifyPhoneNumber(x1,x2),
      _2055: (x0,x1) => globalThis.firebase_auth.PhoneAuthProvider.credential(x0,x1),
      _2057: (x0,x1,x2) => new firebase_auth.RecaptchaVerifier(x0,x1,x2),
      _2058: x0 => x0.clear(),
      _2060: (x0,x1) => x0.confirm(x1),
      _2061: x0 => globalThis.firebase_auth.getAdditionalUserInfo(x0),
      _2062: (x0,x1,x2) => ({errorMap: x0,persistence: x1,popupRedirectResolver: x2}),
      _2063: (x0,x1) => globalThis.firebase_auth.initializeAuth(x0,x1),
      _2064: (x0,x1,x2) => ({accessToken: x0,idToken: x1,rawNonce: x2}),
      _2079: x0 => globalThis.firebase_auth.OAuthProvider.credentialFromError(x0),
      _2088: (x0,x1) => ({displayName: x0,photoURL: x1}),
      _2093: x0 => globalThis.firebase_auth.PhoneMultiFactorGenerator.assertion(x0),
      _2101: () => globalThis.firebase_auth.debugErrorMap,
      _2105: () => globalThis.firebase_auth.browserSessionPersistence,
      _2107: () => globalThis.firebase_auth.browserLocalPersistence,
      _2109: () => globalThis.firebase_auth.indexedDBLocalPersistence,
      _2144: x0 => globalThis.firebase_auth.multiFactor(x0),
      _2145: (x0,x1) => globalThis.firebase_auth.getMultiFactorResolver(x0,x1),
      _2147: x0 => x0.currentUser,
      _2151: x0 => x0.tenantId,
      _2162: x0 => x0.displayName,
      _2163: x0 => x0.email,
      _2164: x0 => x0.phoneNumber,
      _2165: x0 => x0.photoURL,
      _2166: x0 => x0.providerId,
      _2167: x0 => x0.uid,
      _2168: x0 => x0.emailVerified,
      _2169: x0 => x0.isAnonymous,
      _2170: x0 => x0.providerData,
      _2171: x0 => x0.refreshToken,
      _2172: x0 => x0.tenantId,
      _2173: x0 => x0.metadata,
      _2178: x0 => x0.providerId,
      _2179: x0 => x0.signInMethod,
      _2180: x0 => x0.accessToken,
      _2181: x0 => x0.idToken,
      _2182: x0 => x0.secret,
      _2206: x0 => x0.verificationId,
      _2208: x0 => x0.data,
      _2209: x0 => x0.creationTime,
      _2210: x0 => x0.lastSignInTime,
      _2215: x0 => x0.code,
      _2217: x0 => x0.message,
      _2229: x0 => x0.email,
      _2230: x0 => x0.phoneNumber,
      _2231: x0 => x0.tenantId,
      _2232: x0 => x0.email,
      _2233: x0 => x0.previousEmail,
      _2254: x0 => x0.user,
      _2257: x0 => x0.providerId,
      _2258: x0 => x0.profile,
      _2259: x0 => x0.username,
      _2260: x0 => x0.isNewUser,
      _2263: () => globalThis.firebase_auth.browserPopupRedirectResolver,
      _2264: x0 => x0.enrolledFactors,
      _2265: (x0,x1,x2) => x0.enroll(x1,x2),
      _2267: x0 => x0.getSession(),
      _2268: (x0,x1) => x0.unenroll(x1),
      _2269: x0 => x0.displayName,
      _2270: x0 => x0.enrollmentTime,
      _2271: x0 => x0.factorId,
      _2272: x0 => x0.uid,
      _2274: x0 => x0.hints,
      _2275: x0 => x0.session,
      _2276: (x0,x1) => x0.resolveSignIn(x1),
      _2277: x0 => x0.phoneNumber,
      _2287: x0 => ({displayName: x0}),
      _2288: x0 => ({photoURL: x0}),
      _2289: (x0,x1) => x0.getItem(x1),
      _2294: (x0,x1) => x0.getElementById(x1),
      _2295: x0 => x0.remove(),
      _2296: (x0,x1) => x0.appendChild(x1),
      _2297: (x0,x1) => x0.getElementById(x1),
      _2298: x0 => x0.remove(),
      _2301: () => ({}),
      _2302: x0 => globalThis.pdfjsLib.getDocument(x0),
      _2303: (x0,x1) => x0.getPage(x1),
      _2304: (x0,x1) => x0.getViewport(x1),
      _2305: (x0,x1) => x0.getPage(x1),
      _2306: (x0,x1) => x0.getViewport(x1),
      _2307: (x0,x1) => x0.getPage(x1),
      _2308: (x0,x1) => x0.getViewport(x1),
      _2309: (x0,x1) => x0.getPage(x1),
      _2310: (x0,x1) => x0.getViewport(x1),
      _2311: (x0,x1) => x0.getViewport(x1),
      _2312: (x0,x1) => x0.render(x1),
      _2313: (x0,x1,x2,x3,x4) => x0.getImageData(x1,x2,x3,x4),
      _2314: x0 => x0.destroy(),
      _2315: (x0,x1) => x0.getViewport(x1),
      _2316: (x0,x1) => x0.getViewport(x1),
      _2317: (x0,x1) => x0.render(x1),
      _2318: x0 => ({scale: x0}),
      _2320: x0 => x0.deviceMemory,
      _2321: () => globalThis.firebase_core.getApps(),
      _2322: (x0,x1,x2,x3,x4,x5,x6,x7) => ({apiKey: x0,authDomain: x1,databaseURL: x2,projectId: x3,storageBucket: x4,messagingSenderId: x5,measurementId: x6,appId: x7}),
      _2323: (x0,x1) => globalThis.firebase_core.initializeApp(x0,x1),
      _2324: x0 => globalThis.firebase_core.getApp(x0),
      _2325: () => globalThis.firebase_core.getApp(),
      _2328: () => globalThis.firebase_core.SDK_VERSION,
      _2335: x0 => x0.apiKey,
      _2337: x0 => x0.authDomain,
      _2339: x0 => x0.databaseURL,
      _2341: x0 => x0.projectId,
      _2343: x0 => x0.storageBucket,
      _2345: x0 => x0.messagingSenderId,
      _2347: x0 => x0.measurementId,
      _2349: x0 => x0.appId,
      _2351: x0 => x0.name,
      _2352: x0 => x0.options,
      _2353: (x0,x1) => x0.debug(x1),
      _2354: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2354(f,arguments.length,x0) }),
      _2355: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._2355(f,arguments.length,x0,x1) }),
      _2356: (x0,x1) => ({createScript: x0,createScriptURL: x1}),
      _2357: (x0,x1,x2) => x0.createPolicy(x1,x2),
      _2358: (x0,x1) => x0.createScriptURL(x1),
      _2359: (x0,x1,x2) => x0.createScript(x1,x2),
      _2360: (x0,x1) => x0.appendChild(x1),
      _2361: (x0,x1) => x0.appendChild(x1),
      _2362: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2362(f,arguments.length,x0) }),
      _2375: x0 => new Array(x0),
      _2377: x0 => x0.length,
      _2379: (x0,x1) => x0[x1],
      _2380: (x0,x1,x2) => x0[x1] = x2,
      _2383: (x0,x1,x2) => new DataView(x0,x1,x2),
      _2385: x0 => new Int8Array(x0),
      _2386: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      _2387: x0 => new Uint8Array(x0),
      _2393: x0 => new Uint16Array(x0),
      _2395: x0 => new Int32Array(x0),
      _2397: x0 => new Uint32Array(x0),
      _2399: x0 => new Float32Array(x0),
      _2401: x0 => new Float64Array(x0),
      _2403: (o, c) => o instanceof c,
      _2407: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2407(f,arguments.length,x0) }),
      _2408: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2408(f,arguments.length,x0) }),
      _2433: (decoder, codeUnits) => decoder.decode(codeUnits),
      _2434: () => new TextDecoder("utf-8", {fatal: true}),
      _2435: () => new TextDecoder("utf-8", {fatal: false}),
      _2436: x0 => new WeakRef(x0),
      _2437: x0 => x0.deref(),
      _2443: Date.now,
      _2445: s => new Date(s * 1000).getTimezoneOffset() * 60,
      _2446: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      _2447: () => {
        let stackString = new Error().stack.toString();
        let frames = stackString.split('\n');
        let drop = 2;
        if (frames[0] === 'Error') {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      _2448: () => typeof dartUseDateNowForTicks !== "undefined",
      _2449: () => 1000 * performance.now(),
      _2450: () => Date.now(),
      _2451: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      _2452: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      _2453: () => new WeakMap(),
      _2454: (map, o) => map.get(o),
      _2455: (map, o, v) => map.set(o, v),
      _2456: () => globalThis.WeakRef,
      _2467: s => JSON.stringify(s),
      _2468: s => printToConsole(s),
      _2469: a => a.join(''),
      _2470: (o, a, b) => o.replace(a, b),
      _2471: (o, p, r) => o.split(p).join(r),
      _2472: (s, t) => s.split(t),
      _2473: s => s.toLowerCase(),
      _2474: s => s.toUpperCase(),
      _2475: s => s.trim(),
      _2476: s => s.trimLeft(),
      _2477: s => s.trimRight(),
      _2479: (s, p, i) => s.indexOf(p, i),
      _2480: (s, p, i) => s.lastIndexOf(p, i),
      _2481: (s) => s.replace(/\$/g, "$$$$"),
      _2482: Object.is,
      _2483: s => s.toUpperCase(),
      _2484: s => s.toLowerCase(),
      _2485: (a, i) => a.push(i),
      _2488: (a, l) => a.length = l,
      _2489: a => a.pop(),
      _2490: (a, i) => a.splice(i, 1),
      _2492: (a, s) => a.join(s),
      _2493: (a, s, e) => a.slice(s, e),
      _2494: (a, s, e) => a.splice(s, e),
      _2495: (a, b) => a == b ? 0 : (a > b ? 1 : -1),
      _2496: a => a.length,
      _2497: (a, l) => a.length = l,
      _2498: (a, i) => a[i],
      _2499: (a, i, v) => a[i] = v,
      _2501: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      _2502: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      _2503: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      _2504: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      _2505: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      _2506: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      _2507: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      _2508: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      _2510: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      _2511: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      _2512: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      _2513: (t, s) => t.set(s),
      _2514: l => new DataView(new ArrayBuffer(l)),
      _2515: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      _2517: o => o.buffer,
      _2518: o => o.byteOffset,
      _2519: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      _2520: (b, o) => new DataView(b, o),
      _2521: (b, o, l) => new DataView(b, o, l),
      _2522: Function.prototype.call.bind(DataView.prototype.getUint8),
      _2523: Function.prototype.call.bind(DataView.prototype.setUint8),
      _2524: Function.prototype.call.bind(DataView.prototype.getInt8),
      _2525: Function.prototype.call.bind(DataView.prototype.setInt8),
      _2526: Function.prototype.call.bind(DataView.prototype.getUint16),
      _2527: Function.prototype.call.bind(DataView.prototype.setUint16),
      _2528: Function.prototype.call.bind(DataView.prototype.getInt16),
      _2529: Function.prototype.call.bind(DataView.prototype.setInt16),
      _2530: Function.prototype.call.bind(DataView.prototype.getUint32),
      _2531: Function.prototype.call.bind(DataView.prototype.setUint32),
      _2532: Function.prototype.call.bind(DataView.prototype.getInt32),
      _2533: Function.prototype.call.bind(DataView.prototype.setInt32),
      _2536: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      _2537: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      _2538: Function.prototype.call.bind(DataView.prototype.getFloat32),
      _2539: Function.prototype.call.bind(DataView.prototype.setFloat32),
      _2540: Function.prototype.call.bind(DataView.prototype.getFloat64),
      _2541: Function.prototype.call.bind(DataView.prototype.setFloat64),
      _2554: (o, t) => o instanceof t,
      _2556: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2556(f,arguments.length,x0) }),
      _2557: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2557(f,arguments.length,x0) }),
      _2558: o => Object.keys(o),
      _2559: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      _2560: (handle) => clearTimeout(handle),
      _2561: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      _2562: (handle) => clearInterval(handle),
      _2563: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      _2564: () => Date.now(),
      _2565: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      _2566: (x0,x1,x2) => x0.fetch(x1,x2),
      _2567: (x0,x1) => x0.get(x1),
      _2568: f => finalizeWrapper(f, function(x0,x1,x2) { return dartInstance.exports._2568(f,arguments.length,x0,x1,x2) }),
      _2569: (x0,x1) => x0.forEach(x1),
      _2570: x0 => x0.abort(),
      _2571: () => new AbortController(),
      _2572: x0 => x0.getReader(),
      _2573: x0 => x0.read(),
      _2574: x0 => x0.cancel(),
      _2591: x0 => x0.trustedTypes,
      _2592: (x0,x1) => x0.src = x1,
      _2593: (x0,x1) => x0.createScriptURL(x1),
      _2594: x0 => x0.nonce,
      _2595: (x0,x1) => x0.debug(x1),
      _2596: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2596(f,arguments.length,x0) }),
      _2597: x0 => ({createScriptURL: x0}),
      _2598: (x0,x1) => x0.appendChild(x1),
      _2599: (x0,x1) => x0.querySelectorAll(x1),
      _2600: (x0,x1) => x0.item(x1),
      _2601: (x0,x1) => x0.getAttribute(x1),
      _2602: x0 => x0.preventDefault(),
      _2603: x0 => x0.preventDefault(),
      _2604: x0 => x0.preventDefault(),
      _2605: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2605(f,arguments.length,x0) }),
      _2606: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2606(f,arguments.length,x0) }),
      _2609: (x0,x1) => x0.data = x1,
      _2610: (x0,x1) => x0.scale = x1,
      _2611: (x0,x1) => x0.canvasContext = x1,
      _2612: (x0,x1) => x0.viewport = x1,
      _2613: (x0,x1) => x0.annotationMode = x1,
      _2614: (x0,x1) => x0.offsetX = x1,
      _2615: (x0,x1) => x0.offsetY = x1,
      _2616: x0 => x0.promise,
      _2618: x0 => x0.numPages,
      _2624: x0 => x0.width,
      _2625: x0 => x0.height,
      _2626: x0 => x0.promise,
      _2627: x0 => x0.trustedTypes,
      _2629: (x0,x1) => x0.text = x1,
      _2630: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _2631: x0 => x0.click(),
      _2637: (x0,x1) => x0.getContext(x1),
      _2647: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      _2648: (x0,x1) => x0.exec(x1),
      _2649: (x0,x1) => x0.test(x1),
      _2650: (x0,x1) => x0.exec(x1),
      _2651: (x0,x1) => x0.exec(x1),
      _2652: x0 => x0.pop(),
      _2654: o => o === undefined,
      _2673: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      _2675: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      _2676: o => o instanceof RegExp,
      _2677: (l, r) => l === r,
      _2678: o => o,
      _2679: o => o,
      _2680: o => o,
      _2681: b => !!b,
      _2682: o => o.length,
      _2685: (o, i) => o[i],
      _2686: f => f.dartFunction,
      _2687: l => arrayFromDartList(Int8Array, l),
      _2688: l => arrayFromDartList(Uint8Array, l),
      _2689: l => arrayFromDartList(Uint8ClampedArray, l),
      _2690: l => arrayFromDartList(Int16Array, l),
      _2691: l => arrayFromDartList(Uint16Array, l),
      _2692: l => arrayFromDartList(Int32Array, l),
      _2693: l => arrayFromDartList(Uint32Array, l),
      _2694: l => arrayFromDartList(Float32Array, l),
      _2695: l => arrayFromDartList(Float64Array, l),
      _2696: x0 => new ArrayBuffer(x0),
      _2697: (data, length) => {
        const getValue = dartInstance.exports.$byteDataGetUint8;
        const view = new DataView(new ArrayBuffer(length));
        for (let i = 0; i < length; i++) {
          view.setUint8(i, getValue(data, i));
        }
        return view;
      },
      _2698: l => arrayFromDartList(Array, l),
      _2699: () => ({}),
      _2700: () => [],
      _2701: l => new Array(l),
      _2702: () => globalThis,
      _2703: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      _2704: (o, p) => p in o,
      _2705: (o, p) => o[p],
      _2706: (o, p, v) => o[p] = v,
      _2707: (o, m, a) => o[m].apply(o, a),
      _2709: o => String(o),
      _2710: (p, s, f) => p.then(s, f),
      _2711: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        return 17;
      },
      _2712: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _2713: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _2714: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _2715: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _2716: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _2717: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _2718: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _2719: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _2720: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _2721: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _2722: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      _2725: x0 => x0.index,
      _2726: x0 => x0.groups,
      _2728: (x0,x1) => x0.exec(x1),
      _2730: x0 => x0.flags,
      _2731: x0 => x0.multiline,
      _2732: x0 => x0.ignoreCase,
      _2733: x0 => x0.unicode,
      _2734: x0 => x0.dotAll,
      _2735: (x0,x1) => x0.lastIndex = x1,
      _2737: (o, p) => o[p],
      _2738: (o, p, v) => o[p] = v,
      _2739: (o, p) => delete o[p],
      _2740: x0 => x0.random(),
      _2741: x0 => x0.random(),
      _2742: (x0,x1) => x0.getRandomValues(x1),
      _2743: () => globalThis.crypto,
      _2745: () => globalThis.Math,
      _2747: Function.prototype.call.bind(Number.prototype.toString),
      _2748: (d, digits) => d.toFixed(digits),
      _2750: (d, f) => d.toExponential(f),
      _2752: () => globalThis.document,
      _2776: x0 => x0.src,
      _2777: (x0,x1) => x0.src = x1,
      _2778: x0 => x0.naturalWidth,
      _2779: x0 => x0.naturalHeight,
      _2804: x0 => x0.status,
      _2805: (x0,x1) => x0.responseType = x1,
      _2807: x0 => x0.response,
      _2808: () => globalThis.google.accounts.oauth2,
      _2817: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2817(f,arguments.length,x0) }),
      _2818: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2818(f,arguments.length,x0) }),
      _2819: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12) => ({client_id: x0,scope: x1,include_granted_scopes: x2,redirect_uri: x3,callback: x4,state: x5,enable_granular_consent: x6,enable_serial_consent: x7,login_hint: x8,hd: x9,ux_mode: x10,select_account: x11,error_callback: x12}),
      _2821: x0 => x0.code,
      _2824: x0 => x0.error,
      _2827: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2827(f,arguments.length,x0) }),
      _2828: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2828(f,arguments.length,x0) }),
      _2829: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10) => ({client_id: x0,callback: x1,scope: x2,include_granted_scopes: x3,prompt: x4,enable_granular_consent: x5,enable_serial_consent: x6,login_hint: x7,hd: x8,state: x9,error_callback: x10}),
      _2830: x0 => x0.requestAccessToken(),
      _2831: (x0,x1) => x0.requestAccessToken(x1),
      _2834: (x0,x1,x2,x3,x4,x5,x6) => ({scope: x0,include_granted_scopes: x1,prompt: x2,enable_granular_consent: x3,enable_serial_consent: x4,login_hint: x5,state: x6}),
      _2835: x0 => x0.access_token,
      _2836: x0 => x0.expires_in,
      _2839: x0 => x0.token_type,
      _2842: x0 => x0.error,
      _2845: x0 => x0.type,
      _2850: () => globalThis.google.accounts.id,
      _2877: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2877(f,arguments.length,x0) }),
      _2880: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12,x13,x14,x15,x16) => ({client_id: x0,auto_select: x1,callback: x2,login_uri: x3,native_callback: x4,cancel_on_tap_outside: x5,prompt_parent_id: x6,nonce: x7,context: x8,state_cookie_domain: x9,ux_mode: x10,allowed_parent_origin: x11,intermediate_iframe_close_callback: x12,itp_support: x13,login_hint: x14,hd: x15,use_fedcm_for_prompt: x16}),
      _2901: x0 => x0.error,
      _2903: x0 => x0.credential,
      _2914: x0 => globalThis.onGoogleLibraryLoad = x0,
      _2915: f => finalizeWrapper(f, function() { return dartInstance.exports._2915(f,arguments.length) }),
      _3253: (x0,x1) => x0.nonce = x1,
      _3438: (x0,x1) => x0.href = x1,
      _4299: (x0,x1) => x0.src = x1,
      _4301: (x0,x1) => x0.type = x1,
      _4305: (x0,x1) => x0.async = x1,
      _4307: (x0,x1) => x0.defer = x1,
      _4309: (x0,x1) => x0.crossOrigin = x1,
      _4311: (x0,x1) => x0.text = x1,
      _4346: (x0,x1) => x0.width = x1,
      _4348: (x0,x1) => x0.height = x1,
      _4480: x0 => x0.data,
      _4786: () => globalThis.window,
      _4828: x0 => x0.document,
      _4831: x0 => x0.location,
      _4850: x0 => x0.navigator,
      _5112: x0 => x0.trustedTypes,
      _5113: x0 => x0.sessionStorage,
      _5129: x0 => x0.hostname,
      _5228: x0 => x0.maxTouchPoints,
      _5235: x0 => x0.appCodeName,
      _5236: x0 => x0.appName,
      _5237: x0 => x0.appVersion,
      _5238: x0 => x0.platform,
      _5239: x0 => x0.product,
      _5240: x0 => x0.productSub,
      _5241: x0 => x0.userAgent,
      _5242: x0 => x0.vendor,
      _5243: x0 => x0.vendorSub,
      _5245: x0 => x0.language,
      _5246: x0 => x0.languages,
      _5252: x0 => x0.hardwareConcurrency,
      _7488: x0 => x0.signal,
      _7498: x0 => x0.length,
      _7566: () => globalThis.document,
      _7638: x0 => x0.documentElement,
      _7661: x0 => x0.head,
      _8010: (x0,x1) => x0.id = x1,
      _8459: x0 => x0.ctrlKey,
      _8462: x0 => x0.metaKey,
      _8466: x0 => x0.keyCode,
      _9391: x0 => x0.value,
      _9393: x0 => x0.done,
      _10116: x0 => x0.url,
      _10118: x0 => x0.status,
      _10120: x0 => x0.statusText,
      _10121: x0 => x0.headers,
      _10122: x0 => x0.body,
      _14515: () => globalThis.console,
      _14544: () => globalThis.window.flutterCanvasKit,
      _14545: () => globalThis.window._flutter_skwasmInstance,
      _14546: x0 => x0.name,
      _14547: x0 => x0.message,
      _14548: x0 => x0.code,
      _14550: x0 => x0.customData,

    };

    const baseImports = {
      dart2wasm: dart2wasm,


      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
    };

    const deferredLibraryHelper = {
      "loadModule": async (moduleName) => {
        if (!loadDeferredWasm) {
          throw "No implementation of loadDeferredWasm provided.";
        }
        const source = await Promise.resolve(loadDeferredWasm(moduleName));
        const module = await ((source instanceof Response)
            ? WebAssembly.compileStreaming(source, this.builtins)
            : WebAssembly.compile(source, this.builtins));
        return await WebAssembly.instantiate(module, {
          ...baseImports,
          ...additionalImports,
          "wasm:js-string": jsStringPolyfill,
          "module0": dartInstance.exports,
        });
      },
    };

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      "deferredLibraryHelper": deferredLibraryHelper,
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}

