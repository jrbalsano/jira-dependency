import { remote } from 'electron';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILENAME = 'settings.json';
let whenSettingsLoaded;
let currentWriter = Promise.resolve();

function getUserData() {
  return whenSettingsLoaded;
}

function getDirectoryPath() {
  return remote.app.getPath('userData');
}

function getFilePath() {
    return path.join(getDirectoryPath(), SETTINGS_FILENAME);
}

function callFsMethod(methodName, ...args) {
  return new Promise((resolve, reject) => {
    fs[methodName].call(fs, ...args, (err, results) => {
      if (err) {
        return reject(err);
      }

      resolve(results);
    });
  });
}


function writeFile(path, contents) {
  return callFsMethod('writeFile', path, contents);
}

function readFile(path, encoding) {
  return callFsMethod('readFile', path, encoding);
}

function stat(path) {
  return callFsMethod('stat', path);
}

function mkdir(path) {
  return callFsMethod('mkdir', path);
}

function loadUserData() {
  whenSettingsLoaded = readFile(getFilePath(), 'utf8')
    .then(data => {
      if (data === "") {
        return {};
      }
      return JSON.parse(data);
    }, () => { return {}; });

  return whenSettingsLoaded;
}

function saveUserData(newData) {
  if (!whenSettingsLoaded) {
    loadUserData();
  }

  currentWriter = currentWriter.catch(() => {})
    .then(() => whenSettingsLoaded)
    .then(settings => {
      const newSettings = Object.assign({}, settings, newData);
      const settingsString = JSON.stringify(newSettings, null, 2);

      const whenDirectoryExists = stat(getDirectoryPath())
        .catch(() => mkdir(getDirectoryPath()))
        .catch(() => {});

      whenSettingsLoaded = Promise.resolve(newSettings);

      return Promise.all([settingsString, whenDirectoryExists]);
    })
    .then((...args) => {
      writeFile(getFilePath(), args[0][0])
    });


  return currentWriter;
}

export {
  saveUserData,
  loadUserData,
  getUserData
};
