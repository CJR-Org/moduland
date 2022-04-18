export function log(text: string) {
  console.log(`${new Date().toString().split('GMT')[0]}   ${text}`);
}
