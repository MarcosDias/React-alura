import React, {Component} from 'react';
import $ from 'jquery';
import InputCustomizado from './InputCustomizado';
import ButtonCustomizado from './ButtonCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './../TratadorErros';

export default class AutorBox extends Component {
    constructor() {
        super();
        this.state = {
            lista: []
        };
    }

    componentDidMount() {
        $.ajax({
            url: "http://localhost:8080/api/autores",
            dataType: 'json',
            success: (resposta) => {
                this.setState({lista: resposta});
            }
        });

        PubSub.subscribe('atualiza-lista-autores', (topico, novaLista) => {
            this.setState({lista: novaLista});
        });
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de Autores</h1>
                </div>
                <div className="content" id="content">
                    <FormularioAutor/>
                    <TabelaAutores lista={this.state.lista}/>
                </div>

            </div>
        );
    }
}

class FormularioAutor extends Component {
    constructor() {
        super();
        this.state = {
            autor: {
                nome: '',
                email: '',
                senha: ''
            }
        };
        this.handleInput = this.handleInput.bind(this);
        this.enviaForm = this.enviaForm.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();
        $.ajax({
            url: 'http://localhost:8080/api/autores',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify(this.state.autor),
            success: (novaListagem) => {
                PubSub.publish('atualiza-lista-autores', novaListagem);
                this.setState({
                    autor: {
                        nome: '',
                        email: '',
                        senha: ''
                    }
                });
            },
            error: (resposta) => {
                if (resposta.status === 400) {
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
            },
            beforeSend: () => PubSub.publish('limpa-erros', {})
        });
    }

    handleInput(evento) {
        let autor = this.state.autor;
        autor[evento.target.name] = evento.target.value;
        this.setState({ autor });
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado id="nome" type="text" name="nome" value={this.state.autor.nome} onChange={this.handleInput} label="Nome"/>
                    <InputCustomizado id="email" type="email" name="email" value={this.state.autor.email} onChange={this.handleInput} label="Email"/>
                    <InputCustomizado id="senha" type="password" name="senha" value={this.state.autor.senha} onChange={this.handleInput} label="Senha"/>
                    <ButtonCustomizado type="submit" label="Gravar"/>
                </form>
            </div>
        );
    }
}

class TabelaAutores extends Component {
    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.lista.map(autor => {
                            return (
                                <tr key={autor.id}>
                                    <td>{autor.nome}</td>
                                    <td>{autor.email}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}
