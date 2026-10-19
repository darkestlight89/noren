export function snakeCaseConverter(str) {
    const words = str.split("_")
    let convertedStr = "";
    for (let word of words) {
        const converted_word = word[0].toUpperCase() + word.slice(1)
        convertedStr += converted_word + " "
    }
    return convertedStr
}