const findInterchangeTickets = ctx => {
    ctx.session.ticketSearchType = 'INTERCHANGE';
    ctx.scene.enter('selectDepartureStation');
};

export default findInterchangeTickets;
