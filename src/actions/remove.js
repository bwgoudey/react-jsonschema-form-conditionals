/**
 * Remove specified field both from uiSchema and schema
 *
 * @param field
 * @param schema
 * @param uiSchema
 * @returns {{schema: *, uiSchema: *}}
 */
export default function remove(
  field,
  schema = { properties: {} },
  uiSchema = {}
) {
  let requiredIndex = schema.required ? schema.required.indexOf(field) : -1;
  if (requiredIndex !== -1) {
    schema.required.splice(requiredIndex);
  }
  delete schema.properties[field];
  delete uiSchema[field];
  return { schema, uiSchema };
}