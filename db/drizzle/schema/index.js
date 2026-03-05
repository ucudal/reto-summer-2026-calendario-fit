//@todo esta bueno importar todo lo de la db de un único archivo se puede sacar

const base = require("./base");
const links = require("./links");
const rels = require("./relations");

module.exports = {
  ...base,
  ...links,
  ...rels
};
