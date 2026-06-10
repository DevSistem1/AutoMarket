import { useEffect, useMemo, useState } from 'react';
import { Car, Search, PlusCircle, User, MessageCircle, Moon, Sun, ShieldCheck, Gauge, BadgeDollarSign, Repeat2, LogOut } from 'lucide-react';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const marketTable = {
  'Honda Civic Touring': 142000,
  'Toyota Corolla XEI': 151000,
  'Chevrolet Onix LTZ': 82000,
  'Hyundai HB20 Platinum': 91000,
  'Jeep Compass Longitude': 172000,
  'Volkswagen Nivus Highline': 126000,
};

const starterCars = [
  {
    id: 1,
    ownerId: 101,
    ownerName: 'Auto Prime',
    model: 'Honda Civic Touring',
    brand: 'Honda',
    year: 2021,
    km: 39000,
    price: 139900,
    marketPrice: 142000,
    city: 'Campinas, SP',
    fuel: 'Flex',
    exchange: 'Automático',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    description: 'Sedan completo, único dono, revisado e pronto para transferência.',
  },
  {
    id: 2,
    ownerId: 102,
    ownerName: 'Marcos Silva',
    model: 'Toyota Corolla XEI',
    brand: 'Toyota',
    year: 2022,
    km: 28000,
    price: 154500,
    marketPrice: 151000,
    city: 'São Paulo, SP',
    fuel: 'Flex',
    exchange: 'Automático',
    image: 'https://images.unsplash.com/photo-1626072557464-90403d788e04?auto=format&fit=crop&w=1200&q=80',
    description: 'Carro conservado, laudo aprovado, aceito troca por SUV.',
  },
  {
    id: 3,
    ownerId: 103,
    ownerName: 'Juliana Motors',
    model: 'Jeep Compass Longitude',
    brand: 'Jeep',
    year: 2020,
    km: 52000,
    price: 169900,
    marketPrice: 172000,
    city: 'Jundiaí, SP',
    fuel: 'Flex',
    exchange: 'Automático',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    description: 'SUV espaçoso, multimídia, câmera de ré e pneus novos.',
  },
];

const read = (key, fallback) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(read('automarket_user', null));
  const [users, setUsers] = useState(read('automarket_users', [{ id: 101, name: 'Auto Prime', email: 'demo@auto.com', password: '123456' }]));
  const [cars, setCars] = useState(read('automarket_cars', starterCars));
  const [proposals, setProposals] = useState(read('automarket_proposals', []));
  const [messages, setMessages] = useState(read('automarket_messages', []));
  const [selectedCar, setSelectedCar] = useState(cars[0]);
  const [filters, setFilters] = useState({ search: '', brand: '', max: '', type: '' });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const brands = [...new Set(cars.map(car => car.brand))];

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      const term = `${car.model} ${car.brand} ${car.city}`.toLowerCase();
      const matchesSearch = term.includes(filters.search.toLowerCase());
      const matchesBrand = !filters.brand || car.brand === filters.brand;
      const matchesMax = !filters.max || car.price <= Number(filters.max);
      const matchesType = !filters.type || car.exchange === filters.type;
      return matchesSearch && matchesBrand && matchesMax && matchesType;
    });
  }, [cars, filters]);

  function goDetails(car) {
    setSelectedCar(car);
    setPage('details');
    window.scrollTo(0, 0);
  }

  function register(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (users.some(u => u.email === data.email)) return alert('Esse e-mail já está cadastrado.');
    const newUser = { id: Date.now(), name: data.name, email: data.email, password: data.password };
    const updated = [...users, newUser];
    setUsers(updated); write('automarket_users', updated);
    setUser(newUser); write('automarket_user', newUser);
    setPage('dashboard');
  }

  function login(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const found = users.find(u => u.email === data.email && u.password === data.password);
    if (!found) return alert('E-mail ou senha incorretos. Teste demo@auto.com / 123456');
    setUser(found); write('automarket_user', found); setPage('dashboard');
  }

  function logout() {
    setUser(null); localStorage.removeItem('automarket_user'); setPage('home');
  }

  function createCar(e) {
    e.preventDefault();
    if (!user) return setPage('login');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const marketPrice = marketTable[data.model] || Number(data.price);
    const newCar = {
      id: Date.now(), ownerId: user.id, ownerName: user.name,
      model: data.model, brand: data.brand, year: data.year, km: Number(data.km),
      price: Number(data.price), marketPrice, city: data.city, fuel: data.fuel,
      exchange: data.exchange, image: data.image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
      description: data.description,
    };
    const updated = [newCar, ...cars]; setCars(updated); write('automarket_cars', updated);
    alert('Anúncio publicado com sucesso!'); goDetails(newCar);
  }

  function sendProposal(e) {
    e.preventDefault();
    if (!user) return setPage('login');
    if (selectedCar.ownerId === user.id) return alert('Você não pode fazer proposta no próprio anúncio.');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const proposal = { id: Date.now(), carId: selectedCar.id, carModel: selectedCar.model, fromId: user.id, fromName: user.name, toId: selectedCar.ownerId, ...data, status: 'Pendente' };
    const updated = [proposal, ...proposals]; setProposals(updated); write('automarket_proposals', updated);
    alert('Proposta enviada!'); e.currentTarget.reset();
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!user) return setPage('login');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const msg = { id: Date.now(), carId: selectedCar.id, fromId: user.id, fromName: user.name, toId: selectedCar.ownerId, text: data.message };
    const updated = [msg, ...messages]; setMessages(updated); write('automarket_messages', updated); e.currentTarget.reset();
  }

  return (
    <div className="app">
      <header className="navbar">
        <button className="brand" onClick={() => setPage('home')}><Car size={26} /><span>AutoMarket</span></button>
        <nav>
          <button onClick={() => setPage('home')}>Comprar</button>
          <button onClick={() => user ? setPage('create') : setPage('login')}>Anunciar</button>
          <button onClick={() => user ? setPage('dashboard') : setPage('login')}>Painel</button>
        </nav>
        <div className="nav-actions">
          <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun /> : <Moon />}</button>
          {user ? <button className="login-chip" onClick={logout}><LogOut size={17} /> Sair</button> : <button className="login-chip" onClick={() => setPage('login')}><User size={17} /> Entrar</button>}
        </div>
      </header>

      {page === 'home' && <>
        <section className="hero">
          <div className="hero-text">
            <span className="badge"><ShieldCheck size={16}/> Compra, venda e troca com mais controle</span>
            <h1>Encontre o carro certo ou receba propostas pelo seu.</h1>
            <p>Marketplace moderno para anunciar veículos, comparar preço de mercado e negociar por compra, troca ou chat.</p>
            <div className="hero-actions"><button onClick={() => setPage('create')}>Anunciar meu carro</button><button className="ghost" onClick={() => setPage('home')}>Ver ofertas</button></div>
          </div>
          <div className="hero-card"><img src={starterCars[0].image}/><div><b>{brl.format(starterCars[0].price)}</b><span>Preço abaixo do mercado</span></div></div>
        </section>

        <section className="filters">
          <label><Search size={18}/><input placeholder="Buscar por modelo, marca ou cidade" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})}/></label>
          <select value={filters.brand} onChange={e => setFilters({...filters, brand: e.target.value})}><option value="">Todas as marcas</option>{brands.map(b => <option key={b}>{b}</option>)}</select>
          <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}><option value="">Câmbio</option><option>Automático</option><option>Manual</option></select>
          <input type="number" placeholder="Preço máximo" value={filters.max} onChange={e => setFilters({...filters, max: e.target.value})}/>
        </section>

        <section className="section-title"><h2>Carros em destaque</h2><p>{filteredCars.length} anúncios encontrados</p></section>
        <section className="cars-grid">{filteredCars.map(car => <CarCard key={car.id} car={car} onClick={() => goDetails(car)} />)}</section>
      </>}

      {page === 'login' && <Auth login={login} register={register} />}
      {page === 'create' && <CreateCar onSubmit={createCar} />}
      {page === 'details' && selectedCar && <Details car={selectedCar} sendProposal={sendProposal} sendMessage={sendMessage} />}
      {page === 'dashboard' && user && <Dashboard user={user} cars={cars} proposals={proposals} messages={messages} goDetails={goDetails} />}
    </div>
  );
}

function CarCard({ car, onClick }) {
  const diff = car.price - car.marketPrice;
  return <article className="car-card" onClick={onClick}>
    <div className="car-image"><img src={car.image} alt={car.model}/><span>{diff <= 0 ? 'Bom preço' : 'Acima do mercado'}</span></div>
    <div className="car-info"><h3>{car.model}</h3><p>{car.city}</p><strong>{brl.format(car.price)}</strong><div className="car-meta"><span><Gauge size={16}/>{car.km.toLocaleString('pt-BR')} km</span><span>{car.year}</span><span>{car.exchange}</span></div></div>
  </article>;
}

function Auth({ login, register }) {
  const [mode, setMode] = useState('login');
  return <main className="auth-wrap"><div className="auth-card"><h2>{mode === 'login' ? 'Entrar na conta' : 'Criar conta'}</h2><p>Use demo@auto.com e senha 123456 para testar.</p><form onSubmit={mode === 'login' ? login : register}>{mode === 'register' && <input name="name" placeholder="Nome completo" required/>}<input name="email" type="email" placeholder="E-mail" required/><input name="password" type="password" placeholder="Senha" required/><button>{mode === 'login' ? 'Entrar' : 'Cadastrar'}</button></form><button className="link-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Criar uma conta' : 'Já tenho conta'}</button></div></main>;
}

function CreateCar({ onSubmit }) {
  return <main className="form-page"><form className="panel form-grid" onSubmit={onSubmit}><h2><PlusCircle/> Criar anúncio</h2><input name="brand" placeholder="Marca" required/><input name="model" placeholder="Modelo completo" required/><input name="year" type="number" placeholder="Ano" required/><input name="km" type="number" placeholder="Quilometragem" required/><input name="price" type="number" placeholder="Preço desejado" required/><input name="city" placeholder="Cidade/UF" required/><select name="fuel" required><option>Flex</option><option>Gasolina</option><option>Diesel</option><option>Elétrico</option><option>Híbrido</option></select><select name="exchange" required><option>Automático</option><option>Manual</option></select><input className="wide" name="image" placeholder="URL da foto do carro"/><textarea className="wide" name="description" placeholder="Descrição do veículo" required/><button className="wide">Publicar anúncio</button></form></main>;
}

function Details({ car, sendProposal, sendMessage }) {
  return <main className="details-page"><section className="details-hero"><img src={car.image}/><div className="details-info"><span className="badge">{car.city}</span><h1>{car.model}</h1><strong>{brl.format(car.price)}</strong><p>Preço de mercado estimado: {brl.format(car.marketPrice)}</p><div className="stats"><span><Gauge/> {car.km.toLocaleString('pt-BR')} km</span><span><BadgeDollarSign/> {car.year}</span><span><Repeat2/> {car.exchange}</span></div><p>{car.description}</p></div></section><section className="deal-grid"><form className="panel" onSubmit={sendProposal}><h2>Fazer proposta</h2><select name="type"><option>Compra</option><option>Troca</option></select><input name="value" placeholder="Valor ou carro oferecido" required/><textarea name="text" placeholder="Mensagem da proposta" required/><button>Enviar proposta</button></form><form className="panel" onSubmit={sendMessage}><h2><MessageCircle/> Mensagem</h2><input name="message" placeholder="Escreva para o vendedor" required/><button>Enviar mensagem</button></form></section></main>;
}

function Dashboard({ user, cars, proposals, messages, goDetails }) {
  const myCars = cars.filter(c => c.ownerId === user.id);
  const received = proposals.filter(p => p.toId === user.id);
  const sent = proposals.filter(p => p.fromId === user.id);
  const inbox = messages.filter(m => m.toId === user.id || m.fromId === user.id);
  return <main className="dashboard"><section className="section-title"><h2>Olá, {user.name}</h2><p>Gerencie anúncios, propostas e mensagens.</p></section><div className="dash-grid"><div className="panel"><h3>Meus anúncios</h3>{myCars.length ? myCars.map(c => <button className="row" key={c.id} onClick={() => goDetails(c)}>{c.model}<b>{brl.format(c.price)}</b></button>) : <p>Nenhum anúncio ainda.</p>}</div><div className="panel"><h3>Propostas recebidas</h3>{received.length ? received.map(p => <div className="item" key={p.id}><b>{p.fromName}</b><span>{p.carModel} • {p.type}</span><p>{p.text}</p></div>) : <p>Nenhuma proposta recebida.</p>}</div><div className="panel"><h3>Propostas enviadas</h3>{sent.length ? sent.map(p => <div className="item" key={p.id}><b>{p.carModel}</b><span>{p.type}: {p.value}</span><p>{p.status}</p></div>) : <p>Nenhuma proposta enviada.</p>}</div><div className="panel"><h3>Mensagens</h3>{inbox.length ? inbox.map(m => <div className="item" key={m.id}><b>{m.fromName}</b><p>{m.text}</p></div>) : <p>Nenhuma mensagem.</p>}</div></div></main>;
}

export default App;
