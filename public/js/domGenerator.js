const createTag = (tagName, attributes) => {
  const tagElement = document.createElement(tagName);
  Object.entries(attributes).forEach(([attributeName, attributeValue]) => {
    tagElement[attributeName] = attributeValue;
  });
  return tagElement;
};

const generateHTML = ([tag, attributes, ...rest]) => {
  const tagElement = createTag(tag, attributes);

  rest.forEach((element) => {
    if (!Array.isArray(element)) {
      tagElement.innerText = element;
      return;
    }
    const childElement = generateHTML(element);
    tagElement.appendChild(childElement);
  });

  return tagElement;
};
