
const escIdRegex = /escId\((?:[\s\S]*?)\)/gmi,
      escRegex = /esc\((?:[\s\S]*?)\)/gmi;


const parser = (esc, escId, file) => {

  if (file.match(escIdRegex)) {
    let matches = file.match(escIdRegex);

    for (let match of matches) {
      let startIndex = file.indexOf(match);
      let endIndex = startIndex + match.length;

      match = match.trim().substring(0, match.length - 1)
      match = match.replace("escId(", "");
      let firstBlock = file.substring(0, startIndex);
      let secondBlock = file.substring(endIndex, file.length);

      file = firstBlock + escId(match) + secondBlock;
    }
  }

  if (file.match(escRegex)) {
    let matches = file.match(escRegex);

    for (let match of matches) {
      let startIndex = file.indexOf(match);
      let endIndex = startIndex + match.length;

      match = match.trim().substring(0, match.length - 1)
      match = match.replace("esc(", "");
      let firstBlock = file.substring(0, startIndex);
      let secondBlock = file.substring(endIndex, file.length);

      file = firstBlock + esc(match) + secondBlock;
    }
  }

  return file
}

// Performant way to determine if obj coerces to a number
function _isNumerical(obj) {
 obj = obj - 0;
 return obj === obj;
};

const camelize = (string) => {

 if (_isNumerical(string)) {
   return string;
 }

 string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
   return chr ? chr.toUpperCase() : "";
 });

 // Ensure 1st char is always lowercase
 return string.substr(0, 1).toLowerCase() + string.substr(1);

}

export {
  camelize
}

export default parser
