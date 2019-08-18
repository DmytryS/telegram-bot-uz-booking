const findDirectTickets = ctx => {
    ctx.session.ticketSearchType = 'DIRECT';
    ctx.scene.enter('selectDepartureStation');
};

export default findDirectTickets;
