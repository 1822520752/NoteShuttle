        function randomGroups() {
            const playersText = document.getElementById('players-list').value;
            if (!playersText) {
                alert('请输入参与人员');
                return;
            }

            // Split players into array and filter out empty lines
            let players = playersText.split('\n').filter(p => p.trim() !== '');

            // Shuffle players array
            for (let i = players.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [players[i], players[j]] = [players[j], players[i]];
            }

            // Create groups (pairs for doubles)
            const groups = [];
            for (let i = 0; i < players.length; i += 2) {
                if (i + 1 < players.length) {
                    groups.push([players[i], players[i + 1]]);
                } else {
                    // If odd number of players, add last one to the last group
                    if (groups.length > 0) {
                        groups[groups.length - 1].push(players[i]);
                    } else {
                        groups.push([players[i]]);
                    }
                }
            }

            // Display groups with flip animation
            const resultsContainer = document.getElementById('group-results');
            resultsContainer.innerHTML = '';

            groups.forEach((group, index) => {
                const groupCard = document.createElement('div');
                groupCard.className = 'group-card';
                groupCard.innerHTML = `
                    <div class="group-card-front">
                        <div class="group-number">${index + 1}</div>
                        <div>组</div>
                    </div>
                    <div class="group-card-back">
                        ${group.map(player => `<div>${player}</div>`).join('')}
                    </div>
                `;
                resultsContainer.appendChild(groupCard);

                // Add flip animation after a short delay
                setTimeout(() => {
                    groupCard.classList.add('flipped');
                }, 100 * index);
            });

            // Save groups to localStorage
            localStorage.setItem('lastGroups', JSON.stringify(groups));
        }

        function clearGroups() {
            document.getElementById('group-results').innerHTML = '';
            document.getElementById('players-list').value = '';
        }
