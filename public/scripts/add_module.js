function submit() {
  const module_name = $('#module-name').val().trim();
  const repository = $('#repository').val().trim();

  if (validate_input(module_name, repository)) {
    const split = repository.split('/');
    const name = split[0];
    const repo = split[1];

    fetch(`/pkg/add/${module_name}/${name}/${repo}`, { method: 'POST' }).then(
      (response) => {
        response.json().then((json) => {
          if (json.status == 'success') {
            document.location.href = json.url;
          } else {
            alert(json.reason);
          }
        });
      },
    );
  } else {
    alert('bad input');
  }
}

function validate_input(name, repo) {
  return (
    name.length > 0 &&
    !name.includes(' ') &&
    repo.split('/').length == 2 &&
    !repo.startsWith('https://') &&
    !repo.endsWith('.com')
  );
}
