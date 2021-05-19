module.exports.checkUserIsExpired = function (user) {
    // Le membre est considéré comme expiré si:
    // - il/elle existe
    // - il/elle a une date de fin
    // - son/sa date de fin est passée
    return user
      && user.end !== undefined
      && new Date(user.end).getTime() < new Date().getTime();
  };