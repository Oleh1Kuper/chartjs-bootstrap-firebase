import { collection, getDocs, db, query, onSnapshot, updateDoc, doc } from './db.js'

const fetchData = async () => {
  const querySnapshot = await getDocs(collection(db, 'monthsData'));
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push({...doc.data(), id: doc.id });
  });

  return data;
};

let dataFromDB = await fetchData();
const q = query(collection(db, 'monthsData'));

onSnapshot(q, (querySnapshot) => {
  const data = [];

  querySnapshot.forEach((doc) => {
      data.push({...doc.data(), id: doc.id });
  });

  dataFromDB = data;
});

const form = document.querySelector('form');
const ctx = document.getElementById('myChart');
const updateBtns = document.querySelectorAll('.update-btn');
const clearBtn = document.querySelectorAll('.clear-form');
const modalTitle = document.querySelector('.modal-title');
const saveBtn = document.getElementById('save_btn');
let index = 1;

const data = {
  labels: dataFromDB[0].labels,
  datasets: dataFromDB,
};

const options = {
  tension: 0.4,
  fill: true,
  scales: {
    y: {
      beginAtZero: true
    },
  },
};

const chart = new Chart(ctx, {
  data,
  options,
});

clearBtn.forEach(btn => {
  btn.addEventListener('click', () => {
    form.innerHTML = '';
  });
})

updateBtns.forEach(btn => {
  btn.addEventListener('click', () => {
  
    if (btn.id === 'btn-a') {
      modalTitle.innerHTML = 'Company A';
      index = 0
    } else {
      modalTitle.innerHTML = 'Company B';
    }
  
    dataFromDB[0].labels.forEach((item, i) => {
      const childToAppend = `
        <label for="${item}">
          ${item}
          <input
            type="number"
            placeholder="${item}"
            value="${dataFromDB[index].data[i]}"
            class="form-control" id="${item}"
          >
        </label>
      `;
    
      form.innerHTML += childToAppend;
    });
  });
});

saveBtn.addEventListener('click', async () => {
  const data = [];
  const inputs = document.querySelectorAll('input');

  inputs.forEach(item => {
    data.push(+item.value);
  });

  console.log(dataFromDB[index].id);
  const docRef = doc(db, 'monthsData', dataFromDB[index].id);

  try {
    await updateDoc(docRef, {
      ...dataFromDB[index],
      data,
    });

    updateChartData();
  } catch (error) {
    console.error('Error updating user document: ', error);
  }
});

function updateChartData() {
  chart.data.datasets = dataFromDB;
  chart.update();
}
