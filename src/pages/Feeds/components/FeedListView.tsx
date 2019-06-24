import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RouteComponentProps, Link } from "react-router-dom";
import Moment from "react-moment";
import { PageSection, Button, Wizard, Form,
          FormGroup, TextInput } from "@patternfly/react-core";
import { ApplicationState } from "../../../store/root/applicationState";
import { setSidebarActive } from "../../../store/ui/actions";
import { getAllFeedsRequest } from "../../../store/feed/actions";
import { IFeedState } from "../../../store/feed/types";
import { IFeedItem } from "../../../api/models/feed.model";
import { Table, TableVariant } from "@patternfly/react-table";
import { LinkIcon } from "@patternfly/react-icons";
import { DataTableToolbar } from "../../../components/index";
import _ from "lodash";
import debounce from "lodash/debounce";
import SampleForm from "./SampleForm";
import "./FeedListView.scss";
interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
  getAllFeedsRequest: typeof getAllFeedsRequest;
}

interface ComponentState {
    isOpen: boolean;
    isFormValid: boolean;
    formValue: string;
    allStepsValid: boolean;
    stepIdReached: number;
}

type AllProps = IFeedState & IPropsFromDispatch & RouteComponentProps;

class AllFeedsPage extends React.Component<AllProps, ComponentState> {
  constructor(props: AllProps) {
    super(props);
    this.state = {
      isOpen: false,
      isFormValid: false,
      formValue: 'Thirty',
      allStepsValid: false,
      stepIdReached: 1
    };

    this.toggleOpen = this.toggleOpen.bind(this);
    this.onFormChange = this.onFormChange.bind(this);
    this.areAllStepsValid = this.areAllStepsValid.bind(this);
    this.onNext = this.onNext.bind(this);
    this.onBack = this.onBack.bind(this);
    this.onGoToStep = this.onGoToStep.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  toggleOpen() {
    this.setState(({ isOpen }) => ({
      isOpen: !isOpen
    }));
  }

  onFormChange(isValid: any, value: any) {
    this.setState(
      {
        isFormValid: isValid,
        formValue: value
      });
      this.areAllStepsValid();
  }

  areAllStepsValid() {
    this.setState({
      allStepsValid: this.state.isFormValid
    });
  }

  onNext( { id, name }: any, { prevId, prevName }: any ) {
    console.log(`current id: ${id}, current name: ${name}, previous id: ${prevId}, previous name: ${prevName}`);
    this.setState({
      stepIdReached: this.state.stepIdReached < id ? id : this.state.stepIdReached
    });
    this.areAllStepsValid();
  }

  onBack( { id, name }: any, { prevId, prevName }: any ) {
    console.log(`current id: ${id}, current name: ${name}, previous id: ${prevId}, previous name: ${prevName}`);
    this.areAllStepsValid();
  }

  onGoToStep( { id, name }:any, { prevId, prevName }:any ) {
    console.log(`current id: ${id}, current name: ${name}, previous id: ${prevId}, previous name: ${prevName}`);
  }

  onSave() {
    console.log('Saved and closed the wizard');
    this.setState({
      isOpen: false
    });
  }

  componentDidMount() {
    const { setSidebarActive, getAllFeedsRequest } = this.props;
    document.title = "All Feeds - ChRIS UI site";
    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "all_feeds"
    });
    getAllFeedsRequest();
  }

  // Description: Debounce the search call
  // recall with search param by name
  onSearch = debounce((term: string) => {
    this.props.getAllFeedsRequest(term);
  }, 500);


  render() {
    const { feeds } = this.props;
    const { isOpen, isFormValid, formValue, allStepsValid, stepIdReached } = this.state;
    const steps = [
      { id: 1, name: 'Information', component: <p>Step 1</p> },
      {
        name: 'Configuration',
        steps: [
          {
            id: 2,
            name: 'Substep A with validation',
            component: (
              <SampleForm formValue={formValue} isFormValid={isFormValid} onChange={this.onFormChange} />
            ),
            enableNext: isFormValid,
            canJumpTo: stepIdReached >= 2
          },
          { id: 3, name: 'Substep B', component: <p>Substep B</p>, canJumpTo: stepIdReached >= 3 }
        ]
      },
      { id: 4, name: 'Additional', component: <p>Step 3</p>, enableNext: allStepsValid, canJumpTo: stepIdReached >= 4 },
      { id: 5, name: 'Review', component: <p>Step 4</p>, nextButtonText: 'Close', canJumpTo: stepIdReached >= 5 }
    ];

    return (
      <PageSection>
        {!!feeds && (
          <div className="white-bg pf-u-p-lg">
            <Button variant="primary" onClick={this.toggleOpen}>
              Show Wizard
            </Button>
            {isOpen && (
              <Wizard
                isOpen={isOpen}
                title="Validation Wizard"
                description="Validation Wizard Description"
                onClose={this.toggleOpen}
                onSave={this.onSave}
                steps={steps}
                onNext={this.onNext}
                onBack={this.onBack}
                onGoToStep={this.onGoToStep}
              />
            )}
            <DataTableToolbar onSearch={this.onSearch} label="name" />
            <Table
              aria-label="Data table"
              variant={TableVariant.compact}
              cells={[]}
              rows={[]}
            >
              <thead>
                <tr>
                  <th>Feed</th>
                  <th>Pipelines</th>
                  <th>Created</th>
                  <th>Owner</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {feeds.length > 0 &&
                  feeds.map((item: IFeedItem, i) => {
                    return <TableRow key={`items_${i}`} feed={item} />;
                  })}
              </tbody>
            </Table>
          </div>
        )}
      </PageSection>
    );
  }
}

const TableRow = (props: { feed: IFeedItem; key: string }) => {
  const feed = props.feed;
  return (
    <tr>
      <td>
        <Link className="capitalize" to={`/feeds/${feed.id}`}>
          <LinkIcon /> {feed.name}: {feed.id}
        </Link>
      </td>
      <td>
        <em>N/A</em>
      </td>
      <td>
        <Moment format="DD MMM YYYY @ HH:mm A">{feed.creation_date}</Moment>
      </td>
      <td> {feed.creator_username}</td>
      <td>
        <em>N/A</em>
      </td>
    </tr>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string; activeGroup: string }) =>
    dispatch(setSidebarActive(active)),
  getAllFeedsRequest: (name?: string) => dispatch(getAllFeedsRequest(name))
});

const mapStateToProps = ({ ui, feed }: ApplicationState) => ({
  sidebarActiveGroup: ui.sidebarActiveGroup,
  sidebarActiveItem: ui.sidebarActiveItem,
  feeds: feed.feeds
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AllFeedsPage);
