export async function searchPlaces(query) {
  const url = "https://overpass-api.de/api/interpreter";

  const queryTemplate = `
    [out:json];
    node
      [name~"${query}", i]
      (8.38,124.58,8.55,124.70);   // bounding box for CDO
    out center;
  `;

  const response = await fetch(url, {
    method: "POST",
    body: queryTemplate,
  });

  return response.json();
}
