import { useEffect, useMemo, useState } from 'react'
import { Car, Moon, Sun, Search, Plus, User, MessageCircle, HandCoins, LayoutDashboard, LogOut, Heart, Fuel, Gauge, CalendarDays, MapPin } from 'lucide-react'

const seedCars = [
  {
    id: 1,
    ownerId: 1,
    ownerName: 'Auto Prime',
    brand: 'Honda',
    model: 'Civic Touring',
    year: 2020,
    km: 52000,
    price: 119900,
    marketPrice: 122000,
    city: 'Campinas, SP',
    fuel: 'Flex',
    gear: 'Automático',
    acceptsTrade: true,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80',
    description: 'Carro completo, revisado, único dono e com laudo cautelar aprovado.'
  },
  {
    id: 2,
    ownerId: 2,
    ownerName: 'Marina Souza',
    brand: 'Toyota',
    model: 'Corolla XEI',
    year: 2021,
    km: 41000,
    price: 132500,
    marketPrice: 135000,
    city: 'São Paulo, SP',
    fuel: 'Flex',
    gear: 'Automático',
    acceptsTrade: true,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80',
    description: 'Excelente estado, pneus novos, IPVA pago e manual com chave reserva.'
  },
  {
    id: 3,
    ownerId: 3,
    ownerName: 'Lucas Martins',
    brand: 'Jeep',
    model: 'Compass Longitude',
    year: 2019,
    km: 68000,
    price: 116000,
    marketPrice: 118900,
    city: 'Valinhos, SP',
    fuel: 'Flex',
    gear: 'Automático',
    acceptsTrade: false,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    description: 'SUV confortável, revisões em dia, multimídia, câmera de ré e bancos em couro.'
  }
]

function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback
  } catch {
    return fallback
  }
}

function App() {
  const [theme, setTheme] = useState(load('am_theme', 'dark'))
  const [page, setPage] = useState('home')
  const [selectedCar, setSelectedCar] = useState(null)
  const [user, setUser] = useState(load('am_user', null))
  const [users, setUsers] = useState(load('am_users', [{ id: 99, name: 'Demo', email: 'demo@auto.com', password: '123456' }]))
  const [cars, setCars] = useState(load('am_cars', seedCars))
  const [proposals, setProposals] = useState(load('am_proposals', []))
  const [messages, setMessages] = useState(load('am_messages', []))
  const [query, setQuery] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [tradeOnly, setTradeOnly] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('am_theme', JSON.stringify(theme))
  }, [theme])

  function persist(key, value, setter) {
    setter(value)
    localStorage.setItem(key, JSON.stringify(value))
  }

  function register(e) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    if (users.some(u => u.email === data.email)) return alert('Esse e-mail já está cadastrado.')
    const newUser = { id: Date.now(), name: data.name, email: data.email, password: data.password }
    persist('am_users', [...users, newUser], setUsers)
    localStorage.setItem('am_user', JSON.stringify(newUser))
    setUser(newUser)
    setPage('dashboard')
  }

  function login(e) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const found = users.find(u => u.email === data.email && u.password === data.password)
    if (!found) return alert('E-mail ou senha incorretos. Teste demo@auto.com / 123456')
    localStorage.setItem('am_user', JSON.stringify(found))
    setUser(found)
    setPage('dashboard')
  }

  function logout() {
    localStorage.removeItem('am_user')
    setUser(null)
    setPage('home')
  }

  function createCar(e) {
    e.preventDefault()
    if (!user) return setPage('login')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const newCar = {
      id: Date.now(), ownerId: user.id, ownerName: user.name,
      brand: data.brand, model: data.model, year: data.year, km: Number(data.km), price: Number(data.price), marketPrice: Number(data.marketPrice), city: data.city,
      fuel: data.fuel, gear: data.gear, acceptsTrade: data.acceptsTrade === 'on', image: data.image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80', description: data.description
    }
    persist('am_cars', [newCar, ...cars], setCars)
    setSelectedCar(newCar)
    setPage('details')
  }

  function sendProposal(e) {
    e.preventDefault()
    if (!user) return setPage('login')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const item = { id: Date.now(), carId: selectedCar.id, carName: `${selectedCar.brand} ${selectedCar.model}`, fromId: user.id, fromName: user.name, toId: selectedCar.ownerId, type: data.type, value: data.value, text: data.text, status: 'Pendente' }
    persist('am_proposals', [item, ...proposals], setProposals)
    e.currentTarget.reset()
    alert('Proposta enviada!')
  }

  function sendMessage(e) {
    e.preventDefault()
    if (!user) return setPage('login')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const msg = { id: Date.now(), carId: selectedCar.id, carName: selectedCar.model, fromId: user.id, fromName: user.name, toId: selectedCar.ownerId, text: data.message }
    persist('am_messages', [msg, ...messages], setMessages)
    e.currentTarget.reset()
  }

  const filtered = useMemo(() => cars.filter(car => {
    const text = `${car.brand} ${car.model} ${car.city}`.toLowerCase()
    const okText = text.includes(query.toLowerCase())
    const okPrice = !maxPrice || car.price <= Number(maxPrice)
    const okTrade = !tradeOnly || car.acceptsTrade
    return okText && okPrice && okTrade
  }), [cars, query, maxPrice, tradeOnly])

  const NavButton = ({ id, icon: Icon, children }) => <button className={page === id ? 'nav active' : 'nav'} onClick={() => setPage(id)}><Icon size={18}/>{children}</button>

  return <>
    <header className="topbar">
      <button className="brand" onClick={() => setPage('home')}><Car/> AutoMarket</button>
      <nav>
        <NavButton id="home" icon={Search}>Buscar</NavButton>
        <NavButton id="create" icon={Plus}>Anunciar</NavButton>
        {user && <NavButton id="dashboard" icon={LayoutDashboard}>Painel</NavButton>}
        {!user ? <NavButton id="login" icon={User}>Entrar</NavButton> : <button className="nav" onClick={logout}><LogOut size={18}/>Sair</button>}
        <button className="theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun/> : <Moon/>}</button>
      </nav>
    </header>

    {page === 'home' && <main>
      <section className="hero">
        <div>
          <span className="badge">Compra, venda e troca</span>
          <h1>Encontre o carro ideal ou receba propostas pelo seu.</h1>
          <p>Marketplace moderno para anunciar veículos, comparar preço de mercado e negociar com segurança.</p>
          <div className="searchbox">
            <Search/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por marca, modelo ou cidade" />
          </div>
        </div>
        <div className="heroCard"><img src={seedCars[0].image}/><strong>{money(119900)}</strong><span>Honda Civic Touring 2020</span></div>
      </section>

      <section className="filters">
        <input placeholder="Preço máximo" type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        <label><input type="checkbox" checked={tradeOnly} onChange={e => setTradeOnly(e.target.checked)} /> Aceita troca</label>
        <button onClick={() => {setQuery(''); setMaxPrice(''); setTradeOnly(false)}}>Limpar filtros</button>
      </section>

      <section className="sectionTitle"><h2>Carros disponíveis</h2><span>{filtered.length} anúncios</span></section>
      <section className="grid">
        {filtered.map(car => <article className="card" key={car.id}>
          <button className="heart"><Heart size={18}/></button>
          <img src={car.image} alt={car.model}/>
          <div className="cardBody">
            <small>{car.brand}</small><h3>{car.model}</h3>
            <strong>{money(car.price)}</strong>
            <p>Mercado: {money(car.marketPrice)}</p>
            <div className="specs"><span><CalendarDays size={15}/>{car.year}</span><span><Gauge size={15}/>{car.km.toLocaleString('pt-BR')} km</span><span><MapPin size={15}/>{car.city}</span></div>
            <button onClick={() => {setSelectedCar(car); setPage('details')}}>Ver detalhes</button>
          </div>
        </article>)}
      </section>
    </main>}

    {page === 'login' && <main className="authGrid">
      <form className="panel" onSubmit={login}><h2>Entrar</h2><input name="email" placeholder="E-mail" required/><input name="password" type="password" placeholder="Senha" required/><button>Entrar</button><p>Demo: demo@auto.com / 123456</p></form>
      <form className="panel" onSubmit={register}><h2>Cadastrar</h2><input name="name" placeholder="Nome" required/><input name="email" placeholder="E-mail" required/><input name="password" type="password" placeholder="Senha" required/><button>Criar conta</button></form>
    </main>}

    {page === 'create' && <main><form className="panel wide" onSubmit={createCar}><h2>Criar anúncio</h2><div className="formGrid"><input name="brand" placeholder="Marca" required/><input name="model" placeholder="Modelo" required/><input name="year" placeholder="Ano" required/><input name="km" type="number" placeholder="KM" required/><input name="price" type="number" placeholder="Preço pedido" required/><input name="marketPrice" type="number" placeholder="Preço de mercado/FIPE" required/><input name="city" placeholder="Cidade/UF" required/><input name="fuel" placeholder="Combustível" required/><input name="gear" placeholder="Câmbio" required/><input name="image" placeholder="URL da imagem"/></div><label><input name="acceptsTrade" type="checkbox"/> Aceito troca</label><textarea name="description" placeholder="Descrição do veículo" required/><button>Publicar anúncio</button></form></main>}

    {page === 'details' && selectedCar && <main className="details">
      <img className="bigPhoto" src={selectedCar.image}/>
      <section className="panel detailsPanel"><span className="badge">{selectedCar.acceptsTrade ? 'Aceita troca' : 'Venda'}</span><h2>{selectedCar.brand} {selectedCar.model}</h2><strong className="price">{money(selectedCar.price)}</strong><p>Preço de mercado: {money(selectedCar.marketPrice)}</p><div className="specs big"><span><CalendarDays/> {selectedCar.year}</span><span><Gauge/> {selectedCar.km.toLocaleString('pt-BR')} km</span><span><Fuel/> {selectedCar.fuel}</span><span><MapPin/> {selectedCar.city}</span></div><p>{selectedCar.description}</p><p><b>Vendedor:</b> {selectedCar.ownerName}</p></section>
      <section className="panel"><h3><HandCoins/> Fazer proposta</h3><form onSubmit={sendProposal}><select name="type"><option>Compra</option><option>Troca</option><option>Troca + dinheiro</option></select><input name="value" placeholder="Valor ou carro oferecido" required/><textarea name="text" placeholder="Mensagem" required/><button>Enviar proposta</button></form></section>
      <section className="panel"><h3><MessageCircle/> Chat</h3><form onSubmit={sendMessage}><input name="message" placeholder="Digite sua mensagem" required/><button>Enviar</button></form>{messages.filter(m => m.carId === selectedCar.id).map(m => <p className="msg" key={m.id}><b>{m.fromName}:</b> {m.text}</p>)}</section>
    </main>}

    {page === 'dashboard' && user && <main><section className="sectionTitle"><h2>Olá, {user.name}</h2><span>Painel do usuário</span></section><div className="dash"><div className="panel"><h3>Meus anúncios</h3>{cars.filter(c => c.ownerId === user.id).map(c => <p key={c.id}>{c.brand} {c.model} - {money(c.price)}</p>) || 'Nenhum anúncio.'}</div><div className="panel"><h3>Propostas recebidas</h3>{proposals.filter(p => p.toId === user.id).map(p => <p key={p.id}><b>{p.fromName}</b>: {p.type} - {p.value}</p>)}</div><div className="panel"><h3>Propostas enviadas</h3>{proposals.filter(p => p.fromId === user.id).map(p => <p key={p.id}>{p.carName}: {p.status}</p>)}</div><div className="panel"><h3>Mensagens</h3>{messages.filter(m => m.toId === user.id || m.fromId === user.id).map(m => <p key={m.id}><b>{m.fromName}</b>: {m.text}</p>)}</div></div></main>}
  </>
}

export default App
