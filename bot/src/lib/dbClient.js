import cote from 'cote';

const dbClientRequester = new cote.Requester({
    name: 'db requester',
    namespace: 'db'
});

export default dbClientRequester;
