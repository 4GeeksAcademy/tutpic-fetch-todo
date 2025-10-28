import { useState, useEffect } from "react"
import "/workspaces/tutpic-fetch-todo/src/styles/App.css"

const App = () => {
    // LISTA TODO ACTUAL
    const [list, setList] = useState([])
    // NUEVA TAREA TODO
    const [accion, setAccion] = useState("")
    // BOOLEAN QUE SE ACTIVA CUANDO LISTA TODO ESTA VACIA
    const [vacio, setVacio] = useState("false")
    // LISTA DE USUARIOS
    const [users, setUsers] = useState([{ id: 0, name: "placeholder" }])
    // USUARIO SELECCIONADO
    const [currentUser, setCurrentUser] = useState({ name: "", id: null })
    // NOMBRE DE USUARIO NUEVO
    const [newUser, setNewUser] = useState("")

    // PREVENIR REFRESH DE LA PAGINA AL SUBIR FORM

    const submitHandler = (e, fun) => {
        e.preventDefault()
        fun()
    }

    // FUNCION CREAR USUARIO NUEVO

    let crearUsuario = async () => {
        try {
            if (newUser.length == 0) {
                alert("Escriba un nombre de usuario válido")
                return
            }
            let response = await fetch(`https://playground.4geeks.com/todo/users/${newUser}`, {
                method: "POST"
            })
            if (response.status == 422) {
                throw new Error("No ok Nuevo Usuario")
            }
            let data = await response.json()
            alert(`Usuario "${newUser}" creado exitosamente`)
            setNewUser("")
            setUsers([...users, data])
            setCurrentUser(data)
            return data
        } catch (error) {
            console.log(error)
        }
    }

    // FUNCION BORRAR USUARIO 

    const borrarUser = async () => {
        try {
            if (currentUser.name.length == 0) {
                alert("No hay usuario seleccionado")
            }
            let response = await fetch(`https://playground.4geeks.com/todo/users/${currentUser.name}`,
                {
                    method: "DELETE"
                }
            )
            if (response.status == 422) {
                throw new Error("no ok delete")
            }
            setUsers(users.filter(ele => ele.id != currentUser.id))
            alert(`Usuario "${currentUser.name}" borrado exitosamente`)
            setCurrentUser({ name: "", id: null })
        } catch (error) {
            console.log(error)
        }
    }

    // FUNCION BORRAR TAREA TODO DE USUARIO ACTUAL(INCOMPLETA)

    const borrar = async (e) => {
        try {
            let response = await fetch(`https://playground.4geeks.com/todo/todos/${e}`, {
                method: "DELETE"
            })
            if (!response.ok) {
                throw new Error("error borrar tarea")
            }
            setList(list.filter(ele => ele.id != e))
        } catch (error) {
            console.log(error)
        }
    }

    // FUNCION AGREGAR TAREA TODO A USUARIO ACTUAL

    const añadir = async () => {
        try {
            if (accion.length == 0) {
                alert("Añadir tarea válida")
            }
            let payload = {
                label: accion,
                is_done: false
            }
            let response = await fetch(`https://playground.4geeks.com/todo/todos/${currentUser.name}`, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" }
            })
            if (!response.ok) {
                throw new Error("error new task")
            }
            let data = await response.json()
            setAccion("")
            setList([...list, data])
            return data
        } catch (error) {
            console.log(error)
        }

    }

    // BORRAR TODAS LAS TAREAS

    const borrarTodo = async () => {
        for (let obj of list) {
            await borrar(obj.id)
        }
        setList([])
    }

    // MOSTRAR LISTA TODO VACIA

    useEffect(() => {
        list.length == 0 ? setVacio(true) : setVacio(false);
    }, [list])

    // FETCH DE LA LISTA DE USUARIOS

    useEffect(() => {

        let getUsers = async () => {
            try {
                let response = await fetch("https://playground.4geeks.com/todo/users")
                if (!response.ok) {
                    throw new Error("No hay ok")
                }
                let data = await response.json()
                setUsers(data.users)
                return data
            } catch (error) {
                console.log(error)
            }
        }
        getUsers()

    }, [])

    // FETCH DE LA TODO LIST DEL USUARIO SELECCIONADO

    useEffect(() => {

        let getList = async () => {
            try {
                if (currentUser.name.length == 0) {
                    return
                }
                let response = await fetch(`https://playground.4geeks.com/todo/users/${currentUser.name}`)
                if (!response.ok) {
                    throw new Error("No ok")
                }
                let data = await response.json()
                setList(data.todos)
                console.log(data)
                return data
            } catch (error) {
                console.log(error)
            }
        }
        getList()
    }, [currentUser])

    return (
        <div >
            <div id="todo" >

                <h3>Seleccione usuario:</h3>
                <div className="dropdown">
                    <button className="btn btn-secondary dropdown-toggle m-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        {currentUser.name.length > 0 ? currentUser.name : "Seleccionar usuario"}
                    </button>
                    <ul className="dropdown-menu p-0">
                        {users.map((ele) => {
                            return (
                                <li key={ele.id} className="ele select border" onClick={() => setCurrentUser({ name: ele.name, id: ele.id })}>{ele.name}</li>
                            )
                        })}
                    </ul>
                </div>
                <form onSubmit={(e) => { submitHandler(e, crearUsuario) }}>
                    <label className="m-1" htmlFor="nuevoU">Crear nuevo usuario:</label>
                    <input type="text" id="nuevoU" placeholder="Inserte nuevo usuario" value={newUser} onChange={(e) => setNewUser(e.target.value)} />
                    <button className="btn btn-primary m-1" type="submit">Crear Usuario</button>
                </form>
                <h1 className="fs-1 fw-light">To do list</h1>
                <form onSubmit={(e) => submitHandler(e, añadir)} >
                    <input type="text" value={accion} className="form-control fs-5 fw-light" placeholder="¿Que tareas hay que hacer?" onChange={(e) => setAccion(e.target.value)} />
                </form>
                <ul id="lista" className="border border-top-0 border-secondary fw-light fs-5">
                    {list.length > 0 && list.map((ele) => {
                        return <li key={ele.id} className="p-1 border-top border-secondary ele">{ele.label} <button id={ele.id} onClick={(e) => borrar(e.target.id)} className="btn btn-secondary boton">X</button></li>
                    })}
                    {vacio && <li className="p-1 border-top border-secondary fs-5 ele">No hay tareas, añada tareas</li>}
                    <li className="ele my-1 p-1 border-top border-secondary fs-6 fw-lighter">Quedan {list.length} tareas</li>
                </ul>
                <button className="btn btn-danger" onClick={() => borrarUser()}>Borrar usuario actual {currentUser.name && `(${currentUser.name})`}</button>
                {currentUser.name && list.length > 0 && <button className="btn btn-danger m-1" onClick={borrarTodo}>Borrar todas las tareas de {currentUser.name}</button>}
            </div>
        </div>
    )
}

export default App