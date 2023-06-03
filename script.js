window.sendFetch = async function () {
  const doFetch = function () {
    return fetch(window.location.href, {
      method: 'GET',
      credentials: 'include',
    });
  };

  if (document.hasStorageAccess === null) {
    return await doFetch();
  }

  const hasAccess = await document.hasStorageAccess();
  if (hasAccess) {
    return await doFetch();
  }

  // Chromium only thing
  // const permission = await navigator.permissions.query({
  //   name: "storage-access",
  // });

  try {
    await document.requestStorageAccess();
  } catch {
    console.error('Access to our cookies was denied');
  }

  return await doFetch();
};

const ajaxAction = document.querySelector('#ajax-action');

const isInIframe = window.location !== window.parent.location;

ajaxAction.addEventListener('click', () => {
  window.sendFetch()
  return;
  const doFetch = function () {
    return fetch(window.location.href, {
      method: 'GET',
      credentials: 'include',
    });
  };

  if (document.hasStorageAccess === null) {
    return doFetch();
  }

  return document.requestStorageAccess().then(() => {
    document.hasStorageAccess().then((access) => {
      if (access) {
        return doFetch();
      }
    }).catch((e) => {
      console.error(e);
    });
  });


  // Chromium only thing
  // const permission = await navigator.permissions.query({
  //   name: "storage-access",
  // });
});
