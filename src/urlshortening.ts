export function getShortenedURL(
    longurl: string, 
    callback: (shortenedURL: string) => void
){
    fetch(`https://tinyurl.com/api-create.php?url=${longurl}`)
        .then((r)=>r.text())
        .then((text)=>callback(text));
}