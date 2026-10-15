var sss, uriX, uriY;
const PREF_X = "extensions.hide-pdf-scroll.hideHorizontal";
const PREF_Y = "extensions.hide-pdf-scroll.hideVertical";

function makeURI(css) {
  return Services.io.newURI("data:text/css," + encodeURIComponent(css));
}

function setSheet(uri, on) {
  let registered = sss.sheetRegistered(uri, sss.AGENT_SHEET);
  if (on && !registered) sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);
  if (!on && registered) sss.unregisterSheet(uri, sss.AGENT_SHEET);
}

function apply() {
  setSheet(uriX, Services.prefs.getBoolPref(PREF_X, true));
  setSheet(uriY, Services.prefs.getBoolPref(PREF_Y, true));
}

function addMenu(win) {
  let doc = win.document;
  let popup = doc.getElementById("menu_ToolsPopup");
  if (!popup || doc.getElementById("hide-pdf-scroll-x")) return;
  for (let [id, label, pref] of [
    ["hide-pdf-scroll-x", "Hide PDF Horizontal Scrollbar", PREF_X],
    ["hide-pdf-scroll-y", "Hide PDF Vertical Scrollbar", PREF_Y],
  ]) {
    let item = doc.createXULElement("menuitem");
    item.id = id;
    item.setAttribute("label", label);
    item.setAttribute("type", "checkbox");
    if (Services.prefs.getBoolPref(pref, true)) item.setAttribute("checked", "true");
    item.addEventListener("command", () => {
      Services.prefs.setBoolPref(pref, item.getAttribute("checked") === "true");
      apply();
    });
    popup.appendChild(item);
  }
}

function removeMenu(win) {
  for (let id of ["hide-pdf-scroll-x", "hide-pdf-scroll-y"]) {
    win.document.getElementById(id)?.remove();
  }
}

function startup() {
  sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
  uriX = makeURI("#viewerContainer { overflow-x: hidden !important; }");
  uriY = makeURI("#viewerContainer { overflow-y: hidden !important; }");
  apply();
  for (let win of Zotero.getMainWindows()) addMenu(win);
}

function onMainWindowLoad({ window }) { addMenu(window); }
function onMainWindowUnload({ window }) { removeMenu(window); }

function shutdown() {
  if (sss) {
    setSheet(uriX, false);
    setSheet(uriY, false);
  }
  for (let win of Zotero.getMainWindows()) removeMenu(win);
}

function install() {}
function uninstall(data, reason) {
  if (reason === ADDON_UNINSTALL) {
    Services.prefs.clearUserPref(PREF_X);
  }
}
