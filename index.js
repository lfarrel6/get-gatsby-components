#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const gastbyConfig = require(`${process.cwd()}/gatsby-config`);

const THEME_REGEX = /^gatsby-theme/i;

const readFiles = (path) => {
  const files = fs.readdirSync(path);
  return files;
}

const readRelevantModules = (gatsbyThemes, copy = false) => {
  Object.keys(gatsbyThemes).forEach((theme) => {
    gatsbyThemes[theme].forEach((mod) => {
      const files = readFiles(`${process.cwd()}/node_modules/${mod}/src/components`);
      if(copy){
        files.forEach((file) => {
          if(!file.includes('bio-content')){
            const srcPath = `${process.cwd()}/node_modules/${mod}/src/components/${file}`;
            const dest = `${process.cwd()}/src/${theme}/components/${file}`;
            execSync(`cp ${srcPath} ${dest}`);
            console.log(`Copied: ${file}`);
          }
        })
      }
    });
  });
}

const getRelevantNodeModules = (themes) => {
  const modules = fs.readdirSync(`${process.cwd()}/node_modules`);
  const themeObjects = themes.map(({resolve}) => ({
    regex: new RegExp(`^${resolve}`),
    theme: resolve
  }));
  const filtered = modules.reduce((accum, current) => {
    const matchingTheme = themeObjects.find(({regex}) => regex.test(current));
    if(matchingTheme){
      if(!accum[matchingTheme.theme]){
        accum[matchingTheme.theme] = [];
      }
      accum[matchingTheme.theme].push(current);
    }
    return accum;
  }, {});
  return filtered;
}

const getThemes = () => {
  const themes = gastbyConfig.plugins.filter((plugin) => THEME_REGEX.test(plugin.resolve))
  return themes;
}

const getAllComponents = () => {
  const gatsbyThemes = getThemes();
  const relevantModules = getRelevantNodeModules(gatsbyThemes);
  readRelevantModules(relevantModules, true);
}

getAllComponents();