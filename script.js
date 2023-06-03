const ajaxAction = document.querySelector('#ajax-action');

ajaxAction.addEventListener('click', async () => {
  const doFetch = function () {
    return fetch(window.location.href, {
      method: 'GET',
      credentials: 'include',
    });
  };

  if (document.hasStorageAccess === null) {
    return await doFetch();
  }

  await document.requestStorageAccess();
  const hasAccess = await document.hasStorageAccess();
  if (hasAccess) {
    return doFetch();
  }
});
