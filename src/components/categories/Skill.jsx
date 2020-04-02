import React, { Fragment } from 'react';
import { Button, InputGroup, Form, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { MDBPopover, MDBPopoverBody, MDBPopoverHeader, MDBBtn } from "mdbreact";

class Skill extends React.Component {
    constructor(props) {
        super(props);
        this.state = { errMsg: null,
                       items: null,
                       showModal: false}
        this.fetchSkill = this.fetchSkill.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleModalShow = this.handleModalShow.bind(this);
        // this.deleteItem = this.deleteItem.bind(this);
        // this.handleSubmit = this.handleSubmit.bind(this);
        // this.sendRequest = this.sendRequest.bind(this);
    };
    // componentWillMount 

    componentDidMount(){this.fetchSkill();}

    deleteItem = async (skill_id) => {
        await fetch(`${global.deleteAPI}table=Skill&condition=skill_id=${skill_id}`, {
                method: 'GET',
                headers: {
                    'x-api-key': process.env.REACT_APP_API_KEY,
                }
            })
            .then(response => response.json())
            .catch(err => console.log(err));
        this.fetchItems();
    };

    // fetchSkill: retrieves current listings from Transport table
    fetchSkill = async () => {
        await fetch(`${global.selectAPI}table=Skill&field=*`, {
            method: 'GET',
            headers: {
                'x-api-key': process.env.REACT_APP_API_KEY,
            }
        })
        .then(response => response.json())
        .then(object => this.setState({ items: object }));
    };

    handleModalClose = () => {this.setState({showModal: false, file: null})};
    handleModalShow = () => {this.setState({showModal: true})};

    handleSubmit = async () => {
        let skill_title = this.refs.skill_title.value;
        let skill_description = this.refs.skill_description.value;
        if (!skill_title) {
            this.setState({errMsg: "Please provide a title for this item"});
        } else if (!skill_description) {
            this.setState({errMsg: "Please provide a description for this item"});
        } else {
            this.setState({errMsg: null});
    
            if (!this.state.errMsg) {
                // Save to DB
                await this.saveToDB(skill_title, skill_description);
                
                // Update View of Item Listings
                this.fetchSkill();

                // Lastly, close the modal
                this.handleModalClose();
            }
        }
    }

    // handleSubmit: sends book info from Add Listing Modal to DB & refreshes the component

    // sendRequest = async (owner, bookID) => {
    //     if (owner !== global.customAuth.email) {
    //         let rv = await fetch(`${global.backendURL}/query`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json"},
    //             body: JSON.stringify({
    //                 query: `INSERT INTO Notifications (requester_email, offerer_email, item_id) VALUES ("${this.state.user.email}", "${owner}", "${bookID}");`,
    //             })
    //         })
    //         if (rv.status !== 200) {
    //             alert("Uff da! Something went wrong, please try again.");
    //         } else {
    //             alert("Request successfully sent!")
    //         }
    //         console.log(rv);
    //     } else {
    //         alert("You are the owner of this title. Please look for another title.")
    //     }
    // }

    saveToDB = async(skill_title, skill_description) => {
        let url = `${global.insertAPI}table=Skill&field=skill_title,skill_description,owner&value='${skill_title}','${skill_description}',${global.customAuth.email}'`;
        await fetch(url, {
                    method: 'GET',
                    headers: {
                        'x-api-key': process.env.REACT_APP_API_KEY,
                    }
                })
                .then(response => console.log(response))
                .catch(err => console.log(err));
    }

    render() {
        return (
            <Fragment>
                <Row>
                    <Col xs={8} sm={8} md={10} lg={10} xl={10}>
                        <h1 className="categoryName">Skill</h1>
                    </Col>
                    <Col className="justify-content-md-end">
                        {/* Add Listing Button - Only shown if current user is logged in */}
                        { global.customAuth.isAuthenticated && (
                            <Button onClick={this.handleModalShow}>Add Listing</Button>
                            )}
                    </Col>
                </Row>
                <p className="categoryDesc">Care to share a skill?</p>
        
                {!this.state.items
                // No items have been fetched yet
                ? (
                    <Row>
                        <Spinner animation="grow" size="sm" />
                        <p>Loading...</p>
                    </Row>
                )
                : (
                    <Fragment>
                        {this.state.items.length === 0
                         ? // No items exist
                            (<p>No items to display!</p>)
                         : // Render Items
                            <Fragment>
                                {this.state.items.map(item => 
                                    <MDBPopover
                                            placement="bottom"
                                            popover
                                            clickable
                                            key={item.skill_id}
                                            className="mdbpopover"
                                        >
                                            <MDBBtn className="listingBtn">
                                                <figure className="floatLeft">
                                                    {/* <img className="listingImg" src={item.item_img||"https://cdn1.iconfinder.com/data/icons/image-manipulations/100/13-512.png"} alt={item.item_name}/> */}
                                                    <figcaption>{item.skill_title}</figcaption>
                                                </figure>
                                            </MDBBtn>
                                            <div>
                                                <MDBPopoverHeader>{item.skill_title}</MDBPopoverHeader>
                                                <MDBPopoverBody>
                                                    <p style={{display:"none"}} ref="itemID">{item.skill_id}</p>
                                                    <p className="p">{item.skill_title}</p>
                                                    <p className="p">{item.skill_description}</p>
                                                    {global.customAuth.email !== '' && (
                                                        <Fragment>
                                                            {item.owner === global.customAuth.email
                                                            ? <Fragment>
                                                                <Button variant="danger" size="sm" onClick={() => this.deleteItem(item.skill_id)}>Delete</Button>
                                                            </Fragment>
                                                            : <Fragment>
                                                                <p className="p" ref="owner">{item.owner}</p>
                                                                <Button variant="success" size="sm" onClick={() => this.sendRequest(item.owner, item.skill_id)}>Request</Button>
                                                            </Fragment>
                                                            }
                                                        </Fragment>
                                                    )}
                                                </MDBPopoverBody>
                                            </div>
                                        </MDBPopover>
                                )}
                            </Fragment>
                        }
                    </Fragment>
                )}
                {/* Add Listing Modal */}
                <Modal show={this.state.showModal} onHide={this.handleModalClose} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Add a new listing to the Skills Category</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Col>
                            <InputGroup>
                                <InputGroup.Prepend><InputGroup.Text>Skill Title</InputGroup.Text></InputGroup.Prepend>
                                <Form.Control type="text" ref="skill_title" placeholder="Enter Skill Here" />
                            </InputGroup>
                            <Form.Group as={Row}>
                                <Form.Label column sm={3}>Description:</Form.Label>
                                <Col sm={9}>
                                    <Form.Control as="textarea" rows="3" ref="skill_description" placeholder="Please describe your skill here" />
                                </Col>
                            </Form.Group>
                        </Col>

                        <p>{this.state.errMsg}</p>

                        <Row className="bottomRow">
                            <Col xs={12} sm={12} md={3} lg={3} xl={3}>
                                <Button className="btn-submit" variant="success" onClick={this.handleSubmit}>Add Listing</Button>
                            </Col>
                        </Row>
                    </Modal.Body>
                </Modal>
            </Fragment>
        )
    }
}

export default Skill;