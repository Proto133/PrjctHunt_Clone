const fs = require('fs');
const path = require('path');

module.exports = {
    createERT(id, content) {
        console.log({ createERT: content })
        try {
            fs.writeFileSync(path.join(__dirname, '../ERTs', `${id}.ert`), content)
            return true
        } catch (err) {
            console.log(err);
            return false
        }
    },
    deleteERT(id, login) {
        try {
            if (!login) {
                fs.unlink(path.join(__dirname, '../ERTs', `${id}.ert`), (err) => {
                    if (err) throw err;
                    return
                });
            }
            console.log('LOGIN', login)
            fs.unlink(path.join(__dirname, '../ERTs', id), (err) => {
                if (err) throw err;
                return
            });
        } catch (err) {
            console.log(err);
            return err
        }
    },
    readERT(filepath) {
        console.log('Read ERT')
        console.log(filepath.path);
        filepath = path.join(__dirname, '..', filepath)
        console.log({ filepath })
        const ERT = fs.readFileSync(filepath, 'utf8', (err, data) => { err ? console.log(err) : data })
        return ERT
    }


}
