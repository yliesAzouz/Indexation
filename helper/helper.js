export class Helper{
    static removeOcurence(array, letter) {
    //supprime les occurence d'un tableau
    for (let i = 0; i < array.length; i++) {
        if (array[i] == letter) {
            array.splice(i, 1);
            i--;
        }
    }
}
}

