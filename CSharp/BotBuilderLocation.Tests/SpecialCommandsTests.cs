namespace Microsoft.Bot.Builder.Location.Tests
{
    using System.Threading;
    using System.Threading.Tasks;
    using Connector;
    using Builder.Dialogs;
    using Moq;
    using VisualStudio.TestTools.UnitTesting;

    [TestClass]
    public class SpecialCommandsTests
    {
        [TestMethod]
        public async Task If_Help_Command_Post_Help_Message()
        {
            // Arrange
            var dialog = new LocationDialog(string.Empty, "facebook", string.Empty, LocationOptions.UseNativeControl);

            var context = new Mock<IDialogContext>(MockBehavior.Loose);
            context.Setup(c => c.MakeMessage()).Returns(() => new Activity());

            // Act
            await dialog.MessageReceivedAsync(context.Object, TestHelper.CreateAwaitableMessage("help"));

            // Assert
            context.Verify(c => c.PostAsync(It.Is<IMessageActivity>(a => a.Text == "The help message"), It.IsAny<CancellationToken>()), Times.Once);
        }

        [TestMethod]
        public async Task If_Reset_Command_Call_StartAsync()
        {
            // Arrange
            string prompt = "Where do you want to ship your widget?";
            var dialog = new LocationDialog(string.Empty, "facebook", prompt, LocationOptions.None);

            var context = new Mock<IDialogContext>(MockBehavior.Loose);
            context.Setup(c => c.MakeMessage()).Returns(() => new Activity());

            // Act
            await dialog.MessageReceivedAsync(context.Object, TestHelper.CreateAwaitableMessage("reset"));

            // Assert
            context.Verify(c => c.PostAsync(It.Is<IMessageActivity>(a => a.Text == prompt), It.IsAny<CancellationToken>()), Times.Once);
        }

        [TestMethod]
        public async Task If_Cancel_Command_Call_Context_Done()
        {
            // Arrange
            var dialog = new LocationDialog(string.Empty, "facebook", string.Empty, LocationOptions.UseNativeControl);

            var context = new Mock<IDialogContext>(MockBehavior.Loose);
            context.Setup(c => c.MakeMessage()).Returns(() => new Activity());

            // Act
            await dialog.MessageReceivedAsync(context.Object, TestHelper.CreateAwaitableMessage("cancel"));

            // Assert
            context.Verify(c => c.Done(It.Is<Place>(v => v == null)));
        }
    }
}