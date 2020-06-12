export const site = {
  title: "OBG Example",
  feedback: "@hamilton", // can be any string
};

export const plots = [
  {
    source: "test.json", // this is the source file. it is in public/data. It needs to be json for now (an array of objects, like BQ gives you)
    key: "test", // this is the shorthand slug for the link. It needs to be unique!
    type: "line", // the type of chart. Right now just line.
    supertitle: "One Big Graph", // The large text above the title
    title: "A Test Graph", // the title element
    subtitle: "Is this thing on?", // the subtitle element
    description: "more description!", // currently unused.
    x: "stock_date", // the column that gives you the x accessor.
    y: ["priceA", "priceB"], // the y value column name. Unlike x, it can be multiple. If you want only one, wrap a single string in an arrray
    labels: ["Stock A", "Stock B"],
    yMin: 0,
    yMax: 2000,
    yAxisFormat: ".2s",
    yMouseoverFormat: "$,r",
  },
];
