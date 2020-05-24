import execute from "./actions";
import clonedeep from "lodash.clonedeep";
import { deepEquals } from "react-jsonschema-form/lib/utils";

function doRunRules(engine, formData, schema, uiSchema, extraActions = {}) {
  let schemaCopy = clonedeep(schema);
  let uiSchemaCopy = clonedeep(uiSchema);
  let formDataCopy = clonedeep(formData);

  let res = engine.run(formData).then(events => {
    events.forEach(event =>
      execute(event, schemaCopy, uiSchemaCopy, formDataCopy, extraActions)
    );
  });

  return res.then(() => {
    return {
      schema: schemaCopy,
      uiSchema: uiSchemaCopy,
      formData: formDataCopy,
    };
  });
}

export function normRules(rules) {
  return rules.sort(function(a, b) {
    if (a.order === undefined) {
      return b.order === undefined ? 0 : 1;
    }
    return b.order === undefined ? -1 : a.order - b.order;
  });
}

export default function rulesRunner(
  schema,
  uiSchema,
  rules,
  engine,
  extraActions
) {
  engine = typeof engine === "function" ? new engine([], schema) : engine;
  normRules(rules).forEach(rule => engine.addRule(rule));

  return formData => {
    if (formData === undefined || formData === null) {
      return Promise.resolve({ schema, uiSchema, formData });
    }

    return doRunRules(engine, formData, schema, uiSchema, extraActions).then(
      conf => {
        if (deepEquals(conf.formData, formData)) {
          return conf;
        } else {
          return doRunRules(
            engine,
            conf.formData,
            schema,
            uiSchema,
            extraActions
          );
        }
      }
    );
  };
}
