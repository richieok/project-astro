export function nodeColor(object) {
	if (object.isCamera) return '#d98871';
	if (object.isLight) return '#d3c46a';
	return '#8890ee';
}
